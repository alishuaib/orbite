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
 * Module DB Queries
 *
 * @package    local_orbite
 * @copyright  Ali Shuaib
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_orbite\db;

class module{
    public static function query(string $id){
        global $DB;
        //Get module data
        $get_module_type = $DB->get_record_sql("
            SELECT
                mcm.module,
                mcm.instance,
                mm.name as module_type
            FROM m_course_modules AS mcm
            INNER JOIN m_modules AS mm ON mcm.module = mm.id
            WHERE mcm.id = ".$id.";
        ");    
        $module = $DB->get_record_sql("
            SELECT
                mcm.*,
                mm.name,
                mm.timemodified,
                mm.intro
            FROM m_course_modules AS mcm
            INNER JOIN m_".$get_module_type->module_type." AS mm ON mcm.instance = mm.id
            WHERE mcm.id = ".$id.";
        ");
        $module->module_type = $get_module_type->module_type;
        $module->url = (new \moodle_url('/mod/'.$module->module_type.'/view.php', array('id' => $module->id)))->out();        

        return $module;
    }
}