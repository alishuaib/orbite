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
 * Sync DB Queries
 *
 * @package    local_orbite
 * @copyright  Ali Shuaib
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_orbite\db;

class sync{
    public static function queryAll(){
        global $DB;
        $items = $DB->get_records_sql("
            SELECT
                los.*
            FROM m_local_orbite_sync AS los;
        ");
        return $items;
    }

    public static function query(string $itemid, string $type){
        global $DB;
        $item = $DB->get_record_sql("
            SELECT
                los.*
            FROM m_local_orbite_sync AS los 
            WHERE ".$type." = ".$itemid.";
        ");
        return $item;
    }

    public static function update(string $id, string $type ,string $version){
        global $DB;
        $item = $DB->update_record("local_orbite_sync", array(
            'id' => $id,
            $type.'_version' => $version
        ));
        return $item;
    }

    public static function delete(string $id){
        global $DB;
        $item = $DB->delete_records("local_orbite_sync", array(
            'id' => $id
        ));
        return $item;
    }
}