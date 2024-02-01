<?php
// This file is part of Moodle - https://moodle.org/
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
 * Adds admin settings for the plugin.
 *
 * @package     local_orbite
 * @category    admin
 * @copyright   2023 Ali
 * @license     https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

// use core\plugininfo\local;
// use core_admin\admin\admin_setting_plugin_manager;
// use core_analytics\admin_setting_predictor;

defined('MOODLE_INTERNAL') || die();

//Add new settings category for orbite
$ADMIN->add('root', new admin_category('orbite', new lang_string('pluginname', 'local_orbite')));
$settings_section = optional_param('section', 0, PARAM_TEXT);
// Add new general settings page for orbite
if ($hassiteconfig) {    
    $settings_page = new admin_settingpage(
        'managelocalorbite',
        new lang_string('setting:manage', 'local_orbite')
    );

    //TODO: Show server api status and notifications (i.e expiry, maintenance, version check, etc)

    //API KEY config
    $settings_page->add(new admin_setting_configtext(
        'local_orbite/setapikey',
        new lang_string('setting:manage:setapikey', 'local_orbite'),
        new lang_string('setting:manage:setapikeydesc', 'local_orbite'),
        '',
        PARAM_TEXT,
        37
    ));

    $settings_page->add(new admin_setting_configcheckbox(
        'local_orbite/enableautosync',
        new lang_string('setting:manage:enableautosync', 'local_orbite'),
        new lang_string('setting:manage:enableautosyncdesc', 'local_orbite'),
        0
    ));

    $settings_page->add(new admin_setting_configtext(
        'local_orbite/retrylimit',
        new lang_string('setting:manage:retrylimit', 'local_orbite'),
        new lang_string('setting:manage:retrylimitdesc', 'local_orbite'),
        '3',
        PARAM_INT,
        3
    ));

    //Render scheduled task table
    global $PAGE;

    $task_renderer = $PAGE->get_renderer('tool_task');
    // if (!get_config('core', 'cron_enabled')) {
    //     echo $renderer->cron_disabled();
    // }
    $tasks = core\task\manager::get_all_scheduled_tasks();
    $tasks = array_filter($tasks, function ($task) {
        return $task->get_component() == 'local_orbite';
    });
    
    $task_table =  $task_renderer->scheduled_tasks_table($tasks);
    $task_table = html_writer::tag('div', $task_table, array('class' => 'text-primary'));
    
    $output = $PAGE->get_renderer('local_orbite');
    $html = $output->render_accordian(
        "<i class='fa fa-clock-o'></i> Orbite Scheduled Sync Task",
        $task_table
    );

    $settings_page->add(new admin_setting_heading(
        'local_orbite/manage_task',
        '',
        $html
    ));

    if ($settings_section=='managelocalorbite'){
        $footer = \local_orbite\api::footer();
        $settings_page->add(new admin_setting_heading(
            'local_orbite/orbite_footer',
            '',
            $footer
        ));
    }

    $ADMIN->add('orbite', $settings_page);

    $ADMIN->add('orbite', new admin_externalpage(
        'local_orbite_sync',
        get_string('setting:sync', 'local_orbite', null, true),
        new moodle_url('/local/orbite/managecontent.php'),
        'moodle/site:config'
    ));
    $ADMIN->add('orbite', new admin_externalpage(
        'local_orbite_queue',
        get_string('setting:queue', 'local_orbite', null, true),
        new moodle_url('/local/orbite/managequeue.php'),
        'moodle/site:config'
    ));
}
