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
 * Observer class for section
 *
 * @package    local_orbite
 * @copyright  Ali Shuaib
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

 namespace local_orbite\event;

defined('MOODLE_INTERNAL') || die();

class observer_section
{

    /**
     * Course section update event observer.
     * This observer tells orbite servers to verify updated contents.
     * NOTE: Does not capture section move (i.e change of "section" field). Section number/order is not updated until name or summary is updated.
     * @param \core\event\course_section_updated $event The course section created event.
     */
    public static function updated(\core\event\course_section_updated $event)
    {
        //Check if this course is in sync with orbite; otherwise ignore
        $sync_record = \local_orbite\db\sync::query($event->objectid, 'section');
        if (!$sync_record) return;

        $record = \local_orbite\db\section::query($event->objectid);
        $response = \local_orbite\api\section::patch(
            \local_orbite\api\section::builder($record)
        );

        if ($response->isSuccess){
            \local_orbite\db\sync::update($sync_record->id, 'section', $record -> timemodified);
        }
        return;
    }

    /**
     * Course section delete event observer
     * This observer tells orbite servers to forget contents.
     *
     * @param \core\event\course_deleted $event The course section created event.
     */
    public static function deleted(\core\event\course_section_deleted $event)
    {
        //Check if this course is in sync with orbite; otherwise ignore
        $sync_record = \local_orbite\db\sync::query($event->objectid, 'section');
        if (!$sync_record) return;

        
        $response = \local_orbite\api\section::delete($event->objectid);

        if ($response->isSuccess){
            \local_orbite\db\sync::delete($sync_record->id);
        }
    }
}
