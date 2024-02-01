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
 * Observer class for courses
 *
 * @package    local_orbite
 * @copyright  Ali Shuaib
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_orbite\event;

defined('MOODLE_INTERNAL') || die();

class observer_course
{
    /**
     * Course update event observer.
     * This observer tells orbite servers to update details changed for the course.
     *
     * @param \core\event\course_updated $event The course created event.
     */
    public static function updated(\core\event\course_updated $event)
    {
        //Check if this course is in sync with orbite; otherwise ignore
        $sync_record = \local_orbite\db\sync::query($event->objectid, 'course');
        if (!$sync_record) return;

        $record = \local_orbite\db\course::query($event->objectid);
        $response = \local_orbite\api\course::patch(
            \local_orbite\api\course::builder($record)
        );

        if ($response->isSuccess){
            \local_orbite\db\sync::update($sync_record->id, 'course', $record -> timemodified);
        }
        return;
    }

    /**
     * Course delete event observer
     * This observer tells orbite servers to forget contents associated with this course.
     *
     * @param \core\event\course_deleted $event The course created event.
     */
    public static function deleted(\core\event\course_deleted $event)
    {
        //Check if this course is in sync with orbite; otherwise ignore
        $sync_record = \local_orbite\db\sync::query($event->objectid, 'course');
        if (!$sync_record) return;

        
        $response = \local_orbite\api\course::delete($event->objectid);

        if ($response->isSuccess){
            \local_orbite\db\sync::delete($sync_record->id);
        }
    }
}
