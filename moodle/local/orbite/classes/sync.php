<?php
// This file is part of Moodle - http://moodle.org/
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
 * Sync logic for syncing files to Orbite from the queue
 *
 * @package    local_orbite
 * @copyright  Ali Shuaib
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_orbite;

use moodle_url;

defined('MOODLE_INTERNAL') || die();

require_once($CFG->dirroot . '/lib/filestorage/file_system.php');
require_once($CFG->dirroot . '/lib/weblib.php'); //moodle_url
class sync
{
    /**
     * Add file record to local_orbite_queue
     * @param array|object $data
     */
    public static function addToQueue($data)
    {
        global $DB;
        //Check if array or object
        if (is_array($data)){
            $DB->insert_records('local_orbite_queue', $data);
        } else {
            $DB->insert_record('local_orbite_queue', $data);
        }
    }

    /**
     * Add file record to local_orbite_sync after successful upload
     * @param array|object $data
     */
    protected static function addToSyncLog($data)
    {
        global $DB;
        $DB->insert_record('local_orbite_sync', $data);
    }
    protected static function updateToSyncLog($data)
    {
        global $DB;
        $log = $DB->get_record('local_orbite_sync', array(
            'file_id' => $data->file_id
        ));
        $data->id = $log->id;
        $DB->update_record('local_orbite_sync', $data);
    }
    /**
     * Remove file from local_orbite_sync
     * @param int $file_id
     */
    protected static function removeFromSyncLog($file_id){
        global $DB;
        $DB->delete_records('local_orbite_sync', array(
            'file_id' => $file_id
        ));
    }

    /**
     * Remove file from local_orbite_queue
     * @param int $file_id
     */
    public static function removeFileFromQueue($file_id)
    {
        global $DB;
        $DB->delete_records('local_orbite_queue', array(
            'file_id' => $file_id
        ));
    }

    /**
     * Remove course from local_orbite_queue
     * @param int $course_id
     */
    public static function removeCourseFromQueue($course_id)
    {
        global $DB;
        $DB->delete_records('local_orbite_queue', array(
            'course' => $course_id
        ));
        
    }

    /**
     * Sync record from local_orbite_queue
     * @param object $record
     * @param object $course
     * @param object $module
     * @param object $file
     */
    private static function syncRecord($record,$course,$section,$module,$file){

        //Validate file module is not being deleted
        if ($module->deletioninprogress){
            self::removeFileFromQueue($record->file_id);
            return;
        }

        //Validate retry count is not exceeded 
        //(These files will be listed in failed uploads for managequeue.php)
        if ($record->retry > get_config('local_orbite', 'retrylimit')){
            debugging('Retry limit exceeded file_id:'.$record->file_id,DEBUG_DEVELOPER);
            return;
        }
        
        if ($record->is_sync == 0){ //Unsync/Delete file from orbite servers
            $response = \local_orbite\api\content::delete($file->id);
            if ($response->isSuccess){
                self::removeFileFromQueue($record->file_id);
                self::removeFromSyncLog($record->file_id);
            } else {
                global $DB;
                $DB->set_field('local_orbite_queue', 'retry', $record->retry + 1, array('id' => $record->id));
            }
            return;
        } 

        //Get file from moodle file storage
        $fs = get_file_storage();
        $stored_file = $fs->get_file(
            $file->contextid,
            $file->component,
            $file->filearea,
            $file->itemid,
            $file->filepath,
            $file->filename
        );

        //Setup file download url if available
        $file -> download_url = \moodle_url::make_pluginfile_url(
            $file->contextid,
            $file->component,
            $file->filearea,
            $file->itemid,
            $file->filepath,
            $file->filename, 
            false
        ) -> out();

        //Set URLS for view
        $course -> url = (new moodle_url('/course/view.php', array('id' => $course->id)))->out();
        $section -> url = (new moodle_url('/course/view.php', array('id' => $section->course),'section-'.$section->section))->out();        
        $module->url = (new moodle_url('/mod/'.$module->module_type.'/view.php', array('id' => $module->id)))->out();        
        $file -> url = $module -> url;

        //TEMPORARY: Potentially unnecessary check (Assuming check is made before adding to queue)
        if (($stored_file->is_directory())){
            self::removeFileFromQueue($record->file_id);
            return;
        } 
        
        if ($record->is_sync == 2){ //Update content with orbite servers
            $response = \local_orbite\api\content::patch(
                \local_orbite\api\content::builder($course,$section,$module,[$file]),
                [$stored_file]
            );
            if ($response->isSuccess){
                self::removeFileFromQueue($record->file_id);
                self::updateToSyncLog((object)array(
                    'file_id' => $record->file_id,
                    'course' => $course->id,
                    'section' => $section->id,
                    'module' => $module->id,
                    'course_version' => $course->timemodified,
                    'section_version' => $section->timemodified,
                    'module_version' => $module->timemodified,
                ));
            } else {
                global $DB;
                $DB->set_field('local_orbite_queue', 'retry', $record->retry + 1, array('id' => $record->id));
            }
            return;
        } 

        if ($record->is_sync == 1){ //Sync content to orbite servers
            $response = \local_orbite\api\content::post(
                \local_orbite\api\content::builder($course,$section,$module,[$file]),
                [$stored_file]
            );
            if ($response->isSuccess){
                self::removeFileFromQueue($record->file_id);
                self::addToSyncLog((object)array(
                    'file_id' => $record->file_id,
                    'course' => $course->id,
                    'section' => $section->id,
                    'module' => $module->id,
                    'course_version' => $course->timemodified,
                    'section_version' => $section->timemodified,
                    'module_version' => $module->timemodified,
                ));
            } else {
                global $DB;
                $DB->set_field('local_orbite_queue', 'retry', $record->retry + 1, array('id' => $record->id));
            }
            return;
        }
    }

    /**
     * Sync all records from local_orbite_queue
     */
    public static function syncQueue(){
        global $DB;
        $records = $DB->get_records('local_orbite_queue');
        //Get course and module information for each record
        $course_query = $DB->get_records_sql("
        SELECT
            loq.file_id as queue_file_id,
            mc.*,
            mcc.name as category_name
        FROM m_local_orbite_queue AS loq
        INNER JOIN  m_course AS mc ON loq.course_id = mc.id
        INNER JOIN m_course_categories AS mcc ON mcc.id = mc.category
        ");

        $section_query = $DB->get_records_sql("
        SELECT
            loq.file_id as queue_file_id,
            mcs.*
        FROM m_local_orbite_queue AS loq
        INNER JOIN m_course_sections AS mcs ON loq.course_sections_id = mcs.id
        ");

        $get_module_type = $DB->get_records_sql("
        SELECT
            loq.file_id as queue_file_id,
            mcm.module,
            mcm.instance,
            mm.name as module_type
        FROM m_local_orbite_queue AS loq
        INNER JOIN m_course_modules AS mcm ON loq.course_modules_id = mcm.id
        INNER JOIN m_modules AS mm ON mcm.module = mm.id;
        ");        

        $file_query = $DB->get_records_sql("
        SELECT
        loq.file_id as queue_file_id,
            mf.*
        FROM m_local_orbite_queue AS loq
        INNER JOIN m_files AS mf ON loq.file_id = mf.id
        ");

        //Initiate sync request for each file
        foreach ($records as $record) {            
            //Validate that course, module and file exists (in case of deletion and queue mismatch)
            if (
                !isset($course_query[$record->file_id]) || 
                !isset($section_query[$record->file_id]) || 
                !isset($get_module_type[$record->file_id]) || 
                !isset($file_query[$record->file_id])
            ){
                self::removeFileFromQueue($record->file_id);
                continue;
            }
            $course = $course_query[$record->file_id];
            $course -> tags = array_values($DB->get_records_sql("
                SELECT
                    mti.id,
                    mti.tagid,
                    mti.itemtype,
                    mti.itemid,
                    mt.name,
                    mt.rawname,
                    mt.description
                FROM m_tag_instance AS mti
                INNER JOIN m_tag AS mt ON mti.tagid = mt.id
                WHERE itemid = ".$course_query[$record->file_id]->id." AND itemtype = 'course';
            "));
            $section = $section_query[$record->file_id];
            $module = $DB->get_record_sql("
                SELECT
                    loq.file_id as queue_file_id,
                    mcm.*,
                    mm.name,
                    mm.timemodified,
                    mm.intro
                FROM m_local_orbite_queue AS loq
                INNER JOIN m_course_modules AS mcm ON loq.course_modules_id = mcm.id
                INNER JOIN m_".$get_module_type[$record->file_id]->module_type." AS mm ON mcm.instance = mm.id
                WHERE loq.file_id = ".$record->file_id.";
            ");
            $module->module_type = $get_module_type[$record->file_id]->module_type;
            $file = $file_query[$record->file_id];
            
            self::syncRecord($record,$course,$section,$module,$file);
        }
    }

    /**
     * Helper function to validate if auto sync is enabled
     *
     * @return array
     */
    protected static function validate_auto_sync()
    {
        $auto_sync = get_config('local_orbite', 'enableautosync');
        if (!$auto_sync || $auto_sync == '0') return false;
        return true;
    }
}
