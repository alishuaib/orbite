<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Adds admin settings for the plugin. NEEDS REWORK
 *
 * @package     local_orbite
 * @category    admin
 * @copyright   2023 Ali
 * @license     https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once(__DIR__ . '/../../config.php');
require_once($CFG->libdir . '/adminlib.php');

//Setup external admin page
admin_externalpage_setup('local_orbite_sync');

//Read url params
$filter = optional_param('filter', 0, PARAM_STRINGID);
if (!$filter) $filter = 'all'; // Default filter: all

$course_param = optional_param('course', 0, PARAM_INT);
if (!$course_param) $course_param = 0; // Default course: null (unset)

//Set page configurations
$thispage = new moodle_url('/local/orbite/managecontent.php', array('filter' => $filter, 'course' => $course_param));
$PAGE->set_url($thispage);

//Initialize global variables and renderers
global $OUTPUT;
global $DB;
global $PAGE;

$renderer = $PAGE->get_renderer('local_orbite');

//Output header
echo $OUTPUT->header();
echo $OUTPUT->heading(get_string('setting:sync', 'local_orbite'));

/*
    Setup a accordians with tables that contain valid files that can be synched with the orbite chat bot.
    Items will be organized per course and sorted by course id -> module id -> file id.
    The table will be used to sync or unsync content by adding them to corresponding queues.
*/

// Set up filters
echo html_writer::start_div("my-2 d-flex align-items-center");
echo html_writer::tag(
        "h5",
        html_writer::tag("i", "", ["class" => "fa fa-filter fa-lg"]) . " Filters:",
        ["class" => "mr-2 mb-0"]
);
foreach(['all', 'synched', 'unsynced', 'outdated', 'queued'] as $f){
    $style = $filter == $f ? 'primary' : 'secondary';
    echo html_writer::link(
        new moodle_url($thispage, array('filter' => $f)),
        "Show " . ucfirst($f),
        array('class' => "mr-2 btn btn-{$style}")
    );
}
echo html_writer::end_div();

// $data = $response->data;
$data = \local_orbite\db\sync::queryAll();

// Set up content
$content = \local_orbite\helper::getValidContent();
$sorted = array();
foreach ($content as $record) {
    $sorted[$record->course_id][]=$record;
}

foreach ($sorted as $course_id => $records) {
    $table = new html_table();
    $table->head = ['Section Name', 'Module Name', 'File Name' , 'File Size', "Sync Status", "Actions"];

    foreach ($records as $r){
        if ($r->module_deletioninprogress == 1) continue; // Check if module is being deleted (if so, skip)
        
        $filteredData = array_filter($data, function($item) use ($r){
            return $item->file_id == $r -> file_id;
        });
        $version = array_pop($filteredData) -> module_version ?? 0;

        $isInSync = $r->module_timemodified>$version?false:true;
        $redirect = 'managecontent.php?' . (new moodle_url($thispage, array('course' => $course_id)))->get_query_string(false);
        $action = $r->is_queued==1
            ?(
                html_writer::link(
                    new moodle_url('managequeue.php')
                    , "<i class='fa fa-refresh fa-spin fa-lg'></i> In " . ($r->is_sync==1?"Sync":"Unsync") . " Queue",
                    ["class"=>"btn p-0 text-". ($r->is_sync==1?"primary":"danger")]
                )
            )
            :(
                $version==0?
                html_writer::link(
                    new moodle_url('/local/orbite/sync.php',[
                        'method' => 'syncFile',
                        'file' => $r->file_id,
                        'redirect' => $redirect
                    ])
                    , "<i class='fa fa-refresh fa-lg'></i> Sync",
                    ["class"=>"btn text-primary p-0"]
                ):
                html_writer::link(new moodle_url('/local/orbite/sync.php',[
                        'method' => 'unsyncFile',
                        'file' => $r->file_id,
                        'redirect' => $redirect
                    ]),
                    "<i class='fa fa-trash fa-lg'></i> Unsync",
                    ["class"=>"btn text-danger p-0"]
                ) . (!$isInSync?
                        html_writer::link(new moodle_url('/local/orbite/sync.php',[
                            'method' => 'updateFile',
                            'file' => $r->file_id,
                            'redirect' => $redirect
                        ]),
                        "<i class='fa fa-trash fa-lg'></i> Update",
                        ["class"=>"btn text-warning p-0"]
                    )
                :"")
            );
        
        if ($filter != "all"){
            if ($filter == 'synched' && (!$isInSync || $version==0)) continue;
            if ($filter == 'outdated' && ($isInSync || $version==0)) continue;
            if ($filter == 'unsynced' && $version!=0) continue;
            if ($filter == 'queued' && $r->is_queued!=1) continue;
        };
        $table->data[]=[
            $r->section_name,
            $r->module_name,
            $r->file_filename,
            round($r->file_filesize / (1024 * 1024),2) . " MB",
            html_writer::tag(
                "button",
                $version==0?"⚫ Unsynced":($isInSync?"🟢 In-sync":"🟡 Outdated"),
                [
                    "data-toggle"=>"popover",
                    "data-placement"=>"top",
                    "title"=>"Version Status",
                    "data-content"=>"(LMS {$r->module_timemodified})<->(Orbite {$version})",
                    "class"=>"btn p-0"
                ]
            ),
            $action
        ];
    }
    echo $renderer->render_accordian(
        "<i class='fa fa-leanpub'></i> ".$records[0]->course_fullname,
        html_writer::table($table),
        $course_id==$course_param
    );
}

//Output footer
echo \local_orbite\api::footer('isSync');
echo $OUTPUT->footer();