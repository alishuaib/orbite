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
 * Language file.
 *
 * @package   local_orbite
 * @author Ali
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

// This line protects the file from being accessed by a URL directly.
defined('MOODLE_INTERNAL') || die();

// Raw SCSS setting.
$string['pluginname'] = 'Orbite';

$string['setting:manage'] = 'Manage Orbite';
$string['setting:manage:setapikey'] = 'Set Orbite API_KEY';
$string['setting:manage:setapikeydesc'] = 'Set your Orbite API_KEY obtained from orbite.com/admin/plugin';
$string['setting:manage:enableautosync'] = 'Enable Auto Sync';
$string['setting:manage:enableautosyncdesc'] = 'Enable automatically synching new content with Orbite chatbot';
$string['setting:manage:retrylimit'] = 'File Sync Retry Limit';
$string['setting:manage:retrylimitdesc'] = 'Adjust number of attempts to sync file with Orbite chatbot';

$string['setting:sync'] = 'Manage Content Sync';
$string['setting:queue'] = 'Manage Queue';
$string['setting:task'] = 'Manage Task';

$string['table:title'] = "Title";
$string['table:sections'] = "Sections";
$string['table:files'] = "Files";
$string['table:status'] = "Status";
$string['table:content'] = "Content";
$string['table:actions'] = "Actions";
$string['table:version'] = "Version";

$string['sync:schedule_task'] = "Sync Queued files with Orbite chatbot";

$string['warning_noapikey'] = 'No API_KEY registered';
$string['warning_invalidapikey'] = 'Invalid API_KEY length';
$string['warning_nouser'] = 'User not logged in';
$string['info_validkey'] = 'Valid API_KEY & User logged in';
$string['orbitesettingsdesc'] = "This is settings description";
$string['orbitesettingsdesclink'] = "Settings";

$string['eventitemcreated'] = 'Item created';
$string['eventitemcreated_desc'] = 'Item created with ID {$a->objectid}.';
$string['eventitemdeleted'] = 'Item deleted';
$string['eventitemdeleted_desc'] = 'Item with ID {$a->objectid} deleted.';
$string['eventitemrestored'] = 'Item restored';
$string['eventitemrestored_desc'] = 'Item with ID {$a->objectid} restored.';