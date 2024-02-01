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
 * Observer class for modules
 *
 * @package    local_orbite
 * @copyright  Ali Shuaib
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

 namespace local_orbite\event;

defined('MOODLE_INTERNAL') || die();

class observer_module
{
    /**
     * Course module update event observer.
     * This observer tells orbite servers to verify updated contents.
     * NOTE: Checks resource status with servers first before uploading files if needed.
     *
     * @param \core\event\course_module_updated $event The course module created event.
     */
    public static function updated(\core\event\course_module_updated $event)
    {
        //Check if this course is in sync with orbite; otherwise ignore
        $sync_record = \local_orbite\db\sync::query($event->objectid, 'module');
        if (!$sync_record) return;

        $record = \local_orbite\db\module::query($event->objectid);
        $response = \local_orbite\api\module::patch(
            \local_orbite\api\module::builder($record)
        );

        if ($response->isSuccess){
            \local_orbite\db\sync::update($sync_record->id, 'module', $record -> timemodified);
        }
        return;
    }

    /**
     * Course module delete event observer
     * This observer tells orbite servers to forget contents.
     * NOTE: Triggers on cron task running (admin/cli/cron.php)
     *
     * @param \core\event\course_module_deleted $event The course module created event.
     */
    public static function deleted(\core\event\course_module_deleted $event)
    {
        //Check if this course is in sync with orbite; otherwise ignore
        $sync_record = \local_orbite\db\sync::query($event->objectid, 'module');
        if (!$sync_record) return;

        
        $response = \local_orbite\api\module::delete($event->objectid);

        if ($response->isSuccess){
            \local_orbite\db\sync::delete($sync_record->id);
        }
    }    

    /**
     * Course module bin deleted event observer.
     * This observer tells orbite servers to enable a module (when restored from recycle bin).
     * NOTE: Triggers on restore and removal from recycle bin.
     * @param \tool_recyclebin\event\course_bin_item_deleted $event The course module created event.
     */
    public static function bin_deleted(\tool_recyclebin\event\course_bin_item_deleted $event)
    {
        return;
        // //Check if this course is in sync with orbite; otherwise ignore
        // $sync_record = \local_orbite\db\sync::query($event->objectid, 'module');
        // if (!$sync_record) return;

        
        // $response = \local_orbite\api\module::delete($event->objectid);

        // if ($response->isSuccess){
        //     \local_orbite\db\sync::delete($sync_record->id);
        // }
    }
}
