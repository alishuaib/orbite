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
 * Event observer definitions for the plugintype_pluginname plugin.
 *
 * @package   local_orbite
 * @copyright 2023 Ali Shuaib <ali@moonlite.digital>
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

$observers = [
    //Course Observers
    [
        'eventname' => '\core\event\course_updated',
        'callback'  => '\local_orbite\event\observer_course::updated',
    ],
    [
        'eventname' => '\core\event\course_deleted',
        'callback'  => '\local_orbite\event\observer_course::deleted',
    ],

    //Section Observers
    [
        'eventname' => '\core\event\course_section_updated',
        'callback'  => '\local_orbite\event\observer_section::updated',
    ],
    [
        'eventname' => '\core\event\course_section_deleted',
        'callback'  => '\local_orbite\event\observer_section::deleted',
    ],

    //Module Observers
    [
        'eventname' => '\core\event\course_module_updated',
        'callback'  => '\local_orbite\event\observer_module::updated',
    ],
    [
        'eventname' => '\core\event\course_module_deleted',
        'callback'  => '\local_orbite\event\observer_module::deleted',
    ],
    [
        'eventname' => '\tool_recyclebin\event\course_bin_item_deleted',
        'callback'  => '\local_orbite\event\observer_module::bin_deleted',
    ],

];
