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
 * Section DB Queries
 *
 * @package    local_orbite
 * @copyright  Ali Shuaib
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_orbite\db;

class section{
    public static function query(string $id){
        global $DB;
        //Get section data
        $section = $DB->get_record_sql("
            SELECT
                mcs.*
            FROM m_course_sections AS mcs
            WHERE mcs.id = ".$id.";
        ");
        $section -> url = (new \moodle_url('/course/view.php', array('id' => $section->course),'section-'.$section->section))->out();        

        return $section;
    }
}