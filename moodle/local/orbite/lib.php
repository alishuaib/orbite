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
 * @package    local_orbite
 * @author     Ali
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

function local_orbite_before_standard_top_of_body_html()
{
    global $OUTPUT;
    global $COURSE;
    global $DB;

    //Check if user is logged in
    if (!isloggedin()) {
        return;
    }

    //If no course is viewed return
    //  TODO: Display inactive or general chat [UNIMPLEMENTED]
    if ($COURSE->id == 1) {
        return;
    }else{
        $sync_record = \local_orbite\db\sync::query($COURSE->id, 'course');
        if (!$sync_record) return;
    }

    $result = \local_orbite\api::post_request("/chat", [
        'course' => [
            'id' => (int)$COURSE->id,
            'title' => $COURSE->fullname,
        ]
    ]);
    $context = (object)[
        'html' => $result->data,
    ];
    return $OUTPUT->render_from_template('local_orbite/plugin', $context);

    // //If api request failed display warning chat icon
    // if (!($result->isSuccess)) {
    //     $context = (object)[
    //         'warning' => $result->message,
    //     ];
    //     return $OUTPUT->render_from_template('local_orbite/warning', $context);
    // }

    // //Parse JSON response
    // $data = $result;

    // if (!$data) {
    //     // Display placeholder chat icon here from template
    //     $context = (object)[
    //         'warning' => "Servers Offline",
    //     ];
    //     return $OUTPUT->render_from_template('local_orbite/warning', $context);
    // } else if (!$data->success) {
    //     $context = (object)[
    //         'warning' => $data->message,
    //     ];
    //     return $OUTPUT->render_from_template('local_orbite/warning', $context);
    // } else {
    //     $context = (object)[
    //         'html' => $data->html,
    //     ];
    //     return $OUTPUT->render_from_template('local_orbite/plugin', $context);
    // }
}
