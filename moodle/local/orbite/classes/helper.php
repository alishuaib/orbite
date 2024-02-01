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
 * Various helper functions used throughout the plugin
 *
 * @package    local_orbite
 * @copyright  Ali Shuaib
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_orbite;

defined('MOODLE_INTERNAL') || die();

class helper
{
    /** @var array list of supported modules. */
    protected static $supported_modules = array('mod_resource', 'mod_scorm');

    /**
     * Helper function to verify if module in question is supported by orbite
     *
     * @param string $name
     * @return array
     */
    public static function isSupportedModule(string $name)
    {
        return in_array('mod_' . $name, self::$supported_modules);
    }

    /**
     * Helper functions to query DB for local_orbite_queue.
     * Get details on course, module, section, file
     * 
     * @return array Array contained objects of queue records with details
     */
    public static function getOrbiteQueueDetails()
    {
        global $DB;

        $orbite_queue = $DB->get_records('local_orbite_queue', array(), 'timecreated DESC , course_id ASC');

        $get_courses = self::queryReduceByIds('course', array_column($orbite_queue, 'course_id'));
        $get_modules = self::queryReduceByIds('course_modules', array_column($orbite_queue, 'course_modules_id'));
        $get_sections = self::queryReduceByIds('course_sections', array_column($orbite_queue, 'course_sections_id'));
        $get_files = self::queryReduceByIds('files', array_column($orbite_queue, 'file_id'));

        //Parse source activity details (Used for name and type)
        $get_mod = self::queryReduceByIds('modules', array_column($orbite_queue, 'modules_id'));
        $mod = array_unique(array_map(function ($record) use ($get_mod) {
            return $get_mod[$record->modules_id]->name;
        }, $orbite_queue));
        $get_activity = array();
        foreach ($mod as $m) {
            $get_activity[$m] = self::queryReduceByIds($m, array_column($orbite_queue, 'mod_id'));
        }

        $parsed = array();
        foreach ($orbite_queue as $record) {
            $parsed[] = (object) array(
                'record' => $record,
                'course' => $get_courses[$record->course_id],
                'module' => $get_modules[$record->course_modules_id],
                'activity' => $get_activity[$get_mod[$record->modules_id]->name][$record->mod_id],
                'section' => $get_sections[$record->course_sections_id],
                'file' => $get_files[$record->file_id]
            );
        }
        return $parsed;
    }

    private static function queryReduceByIds($table, $ids)
    {
        global $DB;
        $ids = array_filter(array_unique($ids), function ($value) {
            return $value !== null;
        });
        if (count($ids) == 0) return array("" => null);
        $query = $DB->get_records_select(
            $table,
            "id IN ("
                . implode(',', $ids) .
                ")"
        );
        return array_reduce($query, function ($r, $i) {
            $r[$i->id] = $i;
            return $r;
        }, array());
    }

    /**
     * Helper function to query DB for file info based on course ID.
     * 
     * @param int $course_id
     * @param bool $clean Clean the query results based on supported modules
     * @return array Array containing objects of query
     */
    public static function getCourseFilesByID($course_id, $clean = true)
    {
        global $DB;

        $query = $DB->get_records_sql("
        SELECT 
            mf.id AS file_id, 
            mf.filename AS file_filename,
            mf.component AS file_component,
            mf.filearea AS file_filearea,
            mf.mimetype AS file_mimetype,
            mcm.id AS course_modules_id, 
            mcm.section AS course_sections_id, 
            mcm.course AS course_id,    
            mcm.module AS modules_id,
            mcm.instance AS mod_id
        FROM m_course_modules AS mcm
        INNER JOIN m_context AS mc ON mcm.id = mc.instanceid
        INNER JOIN m_files AS mf ON mc.id = mf.contextid
        INNER JOIN m_modules AS mmod ON mcm.module = mmod.id
        WHERE mcm.course = {$course_id} 
        AND mf.component IN (" .
            implode(',', array_map(function ($module) {
                return "'" . $module . "'";
            }, self::$supported_modules))
            . ");
        ");

        if ($clean) $query = self::validateFileRecord($query);
        return $query;
    }

    /**
     * Helper function to query DB for file info based on file ID.
     * 
     * @param int $file_id
     * @return array Array containing objects of query
     */
    public static function getFileByID($file_id)
    {
        global $DB;

        $query = $DB->get_record_sql("
        SELECT 
            mf.id AS file_id, 
            mf.filename AS file_filename,
            mf.component AS file_component,
            mf.filearea AS file_filearea,
            mf.mimetype AS file_mimetype,
            mcm.id AS course_modules_id, 
            mcm.section AS course_sections_id, 
            mcm.course AS course_id,    
            mcm.module AS modules_id,
            mcm.instance AS mod_id
        FROM m_course_modules AS mcm
        INNER JOIN m_context AS mc ON mcm.id = mc.instanceid
        INNER JOIN m_files AS mf ON mc.id = mf.contextid
        INNER JOIN m_modules AS mmod ON mcm.module = mmod.id
        WHERE mf.id = {$file_id}
        AND mf.component IN (" .
            implode(',', array_map(function ($module) {
                return "'" . $module . "'";
            }, self::$supported_modules))
            . ");
        ");

        return $query;
    }

    /**
     * Helper function to query DB for course content that considered valid based on orbite supported formats
     * 
     * @return array Array containing objects of query
     */
    public static function getValidContent(){
        global $DB;

        $query = $DB->get_records_sql("
        SELECT
        -- Unique Identifier
            mf.id as file_id,
        -- Course Information
            mc.id AS course_id,
            mc.fullname AS course_fullname,
            mc.shortname AS course_shortname,
            mc.category AS course_category,
            mc.timemodified AS course_timemodified,
        -- Module Information
            mcm.id AS module_id,
            mcm.module AS module_type,
            mcm.instance AS module_instance,
            mcm.deletioninprogress AS module_deletioninprogress,
            CASE
                WHEN mscorm.id IS NOT NULL AND mm.name = 'scorm' THEN mscorm.name
                WHEN mresource.id IS NOT NULL AND mm.name = 'resource' THEN mresource.name
                ELSE NULL
            END AS module_name,
            CASE
                WHEN mscorm.id IS NOT NULL AND mm.name = 'scorm' THEN mscorm.timemodified
                WHEN mresource.id IS NOT NULL AND mm.name = 'resource' THEN mresource.timemodified
                ELSE NULL
            END AS module_timemodified,
        -- Section Information
            ms.id AS section_id,
            COALESCE(ms.name, CONCAT('Topic ', ms.section)) AS section_name,
            ms.sequence AS section_sequence,
            ms.timemodified AS section_timemodified,
        -- File Information
            mf.filename AS file_filename,
            mf.component AS file_component,
            mf.filearea AS file_filearea,
            mf.mimetype AS file_mimetype,
            mf.filesize AS file_filesize,
            mf.timemodified AS file_timemodified,
        -- Check Queue Information
            CASE
                WHEN loq.file_id IS NOT NULL THEN 1
                ELSE 0
            END AS is_queued,
            CASE
                WHEN loq.file_id IS NOT NULL THEN loq.is_sync
                ELSE NULL
            END AS is_sync
        FROM
            m_course AS mc
        INNER JOIN
            m_course_modules AS mcm ON mc.id = mcm.course
        INNER JOIN
            m_modules AS mm ON mcm.module = mm.id
        INNER JOIN 
            m_context as mctx on mcm.id = mctx.instanceid
        inner join 
            m_course_sections as ms on mcm.section = ms.id
        LEFT JOIN
            m_files AS mf ON mctx.id = mf.contextid
        LEFT JOIN
            m_scorm AS mscorm ON mcm.instance = mscorm.id
        LEFT JOIN
            m_resource AS mresource ON mcm.instance = mresource.id
        LEFT JOIN
            m_local_orbite_queue AS loq ON mf.id = loq.file_id
        AND mf.component IN (" .
            implode(',', array_map(function ($module) {
                return "'" . $module . "'";
            }, self::$supported_modules))
            . ")        
        AND 
            mf.filename not in ('.','..')
        WHERE
            mf.component IS NOT NULL and
            mf.mimetype IS NOT NULL and
            mcm.deletioninprogress = 0 and
            (
                mf.component != 'mod_scorm' or
                (mf.component = 'mod_scorm' and (mf.mimetype = 'application/zip' or mf.mimetype = 'package'))
            )
        ORDER BY
            mc.id, mcm.id, mf.id"
        );

        foreach($query as $key=>$record){
            if($record->file_filename == '.' || $record->file_filename == '..'){
                unset($query[$key]);
            }
            if ($record->file_component == "mod_scorm" && ($record->file_mimetype !== 'application/zip' || $record->file_filearea !== 'package')){
                unset($query[$key]);
            }
        }

        return $query;
    }

    /**
     * Helper function to validate file records based on supported modules
     * 
     * @param array $records Array of file (or partial file) records
     * @return array Array of validated file (or partial file) records
     */
    public static function validateFileRecord($records)
    {
        $validated = array();
        foreach ($records as $r) {
            //mod_resource clean up
            if ($r->file_filename == '.' || $r->file_filename == '..') continue; //Skip if file is a directory (AKA: . or ..)

            //mod_scorm clean up
            if ($r->file_component == "mod_scorm" && ($r->file_mimetype !== 'application/zip' || $r->file_filearea !== 'package')) continue; //Only accept main package file

            $validated[] = $r;
        }
        return $validated;
    }
}
