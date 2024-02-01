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
 * Course DB Queries
 *
 * @package    local_orbite
 * @copyright  Ali Shuaib
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_orbite\db;

class course{
    public static function query(string $id){
        global $DB;
        //Get course data
        $course = $DB->get_record_sql("
            SELECT
                mc.*,
                mcc.name as category_name
            FROM  m_course AS mc 
            INNER JOIN m_course_categories AS mcc ON mcc.id = mc.category
            WHERE mc.id = ".$id.";
        ");
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
            WHERE itemid = ".$id." AND itemtype = 'course';
        "));
        $course -> url = (new \moodle_url('/course/view.php', array('id' => $course->id)))->out();
        return $course;
    }
}