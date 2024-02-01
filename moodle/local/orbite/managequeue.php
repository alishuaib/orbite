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
 * Adds admin settings for the plugin.
 *
 * @package     local_orbite
 * @category    admin
 * @copyright   2023 Ali
 * @license     https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

//Required libraries and configurations
require_once(__DIR__ . '/../../config.php');
require_once($CFG->libdir . '/adminlib.php');

//Setup external admin page
admin_externalpage_setup('local_orbite_sync');

//Set page configurations
$thispage = new moodle_url('/local/orbite/managequeue.php');
$PAGE->set_url($thispage);

//Initialize global variables
global $DB;

//Output header and page heading
echo $OUTPUT->header();
echo $OUTPUT->heading(get_string('setting:queue', 'local_orbite'));

/*
    Setup a table to display items in queue to be synched by plugin scheduled tasks.
    Items will be organized per course and sorted by timecreated.
    The table will be used to remove items from queue.
*/

// TODO: Add filters for failed queue items (AKA exceeded retry limit)
// TODO: Show badges for number of items in each filter
$queue = \local_orbite\helper::getOrbiteQueueDetails();

if (empty($queue)) {
    echo html_writer::tag('div', 'No items in currently in queue', array('class' => 'alert alert-info'));
    echo \local_orbite\api::footer('isQueue');
    echo $OUTPUT->footer();
    die();
}

$table_data = array();
foreach ($queue as $element) {
    $table_data[$element->course->id][] = $element;
}

$selected_course = null;
foreach ($table_data as $course_id => $elements) {
    if ($selected_course = null || $selected_course != $course_id) {
        if($selected_course != $course_id) echo html_writer::end_div();
        $selected_course = $course_id;
        echo html_writer::start_div('border border-info rounded',[
            'style' => 'border-style: dashed !important;'
        ]);
        echo html_writer::tag(
            'span',
            "<i class='fa fa-leanpub'></i> ".$elements[0]->course->fullname,
            array(
                'class' => 'btn text-primary border border-primary rounded btn-lg btn-block mb-2',
                'style' => 'border-width: 3px !important;'
            )
        );
        echo html_writer::div(
            html_writer::link(
                new moodle_url(
                    '/local/orbite/sync.php',
                    array(
                        'method' => 'removeCourse',
                        'course' => $course_id,
                        'name' => 'All files from ' . $elements[0]->course->fullname,
                        'redirect' => 'managequeue.php'
                    )
                ),
                "<i class='fa fa-trash'></i> Remove All",
                ["class"=>"btn btn-outline-danger mb-2"]
            ),
            'text-center'
        );
    }

    $table = new html_table();
    $table->head = array('Sync ID', 'File Name', 'Module Name', 'Section Name', "Time Added", "Reason" , "Action");
    foreach ($elements as $element) {
        $is_sync = $element->record->is_sync==1 
            ? html_writer::span("🟢 Sync",'text-success') :
            ($element->record->is_sync==2 ?
                html_writer::span("🟡 Update",'text-primary') :
                html_writer::span("🔴 Unync",'text-danger'));
        $table->data[] = array(
            $element->record->id,
            $element->file->filename ?? null,
            $element->activity->name ?? null,
            $element->section->name ?? "Topic ".$element->section->section,
            date('Y-m-d H:i:s', $element->record->timecreated),
            $is_sync,
            html_writer::link(
                new moodle_url(
                    '/local/orbite/sync.php',
                    array(
                        'method' => 'removeFile',
                        'id' => $element->record->id,
                        'name' => $element->file->filename,
                        'redirect' => 'managequeue.php'
                    )
                ),
                "<i class='fa fa-trash fa-lg'></i> Remove" ,
                ["class"=>"btn text-danger p-0"]
            )
        );
    }
    echo html_writer::table($table);
}
echo html_writer::end_div();

echo \local_orbite\api::footer('isQueue');
echo $OUTPUT->footer();
