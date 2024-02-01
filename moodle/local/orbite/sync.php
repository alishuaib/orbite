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

require_once(__DIR__ . '/../../config.php');
require_once($CFG->libdir . '/adminlib.php');


admin_externalpage_setup('local_orbite_sync');
//Read url params
$redirect = optional_param('redirect', 'managecontent.php', PARAM_URL);
$method = optional_param('method', 0, PARAM_STRINGID); // addCourse, addFile, removeCourse, removeFile
$name = optional_param('name', 0, PARAM_TEXT);

$id = optional_param('id', 0, PARAM_INT);
$course = optional_param('course', 0, PARAM_INT);
$section = optional_param('section', 0, PARAM_INT);
$module = optional_param('module', 0, PARAM_INT);
$file = optional_param('file', 0, PARAM_INT);

$thispage = '/local/orbite/sync.php';
$PAGE->set_url(new moodle_url($thispage));


global $DB;
switch ($method) {
    case 'syncCourse':
        //Add Course to queue in local_orbite_queue $DB
        $notif = "Added Course to queue";
        $query_records = \local_orbite\helper::getCourseFilesByID($course);

        $insert_records = array();

        foreach ($query_records as $r) {
            $insert_records[] = (object) array_merge((array)$r, array(
                'timecreated' => time(),
                'source' => 'course',
                'retry' => 0,
                'is_sync' => 1
            ));
        }

        $DB->insert_records('local_orbite_queue', $insert_records);
        
        break;
    case 'syncFile':
        $notif = "Added File to Sync queue :: <a href='managequeue.php'>View Queue</a>";
        $record = \local_orbite\helper::getFileByID($file);
        $insert = (object) array_merge((array)$record, array(
            'timecreated' => time(),
            'source' => 'file',
            'retry' => 0,
            'is_sync' => 1
        ));
        $DB->insert_record('local_orbite_queue', $insert);
        break;
    case 'unsyncFile':
        $notif = "Added File to Unsync queue  :: <a href='managequeue.php'>View Queue</a>";
        $record = \local_orbite\helper::getFileByID($file);
        $insert = (object) array_merge((array)$record, array(
            'timecreated' => time(),
            'source' => 'file',
            'retry' => 0,
            'is_sync' => 0
        ));
        $DB->insert_record('local_orbite_queue', $insert);
        break;
    case 'updateFile':
        $notif = "Added File to Update queue  :: <a href='managequeue.php'>View Queue</a>";
        $record = \local_orbite\helper::getFileByID($file);
        $insert = (object) array_merge((array)$record, array(
            'timecreated' => time(),
            'source' => 'file',
            'retry' => 0,
            'is_sync' => 2
        ));
        $DB->insert_record('local_orbite_queue', $insert);
        break;
    case 'removeFile':
        //Remove File from queue in local_orbite_queue $DB
        $notif = "Removed [{$name}] in queue";
        $DB->delete_records('local_orbite_queue', array(
            'id' => $id
        ));
        break;
    case 'removeCourse':
        //Remove Course from queue in local_orbite_queue $DB
        $notif = "Removed [{$name}] in queue";
        $DB->delete_records('local_orbite_queue', array(
            'course_id' => $course
        ));
        break;
    default:
        break;
}

redirect($redirect, $notif, 0);
exit;
