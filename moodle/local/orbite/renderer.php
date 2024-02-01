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


defined('MOODLE_INTERNAL') || die();

/**
 * Plugin's renderer.
 *
 * @package   local_sitenotice
 * @author    Nathan Nguyen <nathannguyen@catalyst-au.net>
 * @copyright Catalyst IT
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class local_orbite_renderer extends plugin_renderer_base {

    /**
     * Render table.
     * @param string $title Title for the accordian
     * @param string $html HTML to be rendered in accordian
     * @return false|string
     */
    public function render_accordian($title,$html, $isOpen = false, $attr = [ "class" => "btn btn-lg btn-block btn-outline-primary" ]) {
        //Generate random id for accordian
        $id = rand(0, 1000000);
        $string = html_writer::tag(
            "div",
            html_writer::tag(
                "div",
                html_writer::tag(
                    "div",
                    html_writer::tag("span", $title, array_merge($attr,[
                        "data-toggle" => "collapse",
                        "data-target" => "#collapse".$id
                    ])),
                    [
                        "id" => "headingOne",
                        "class" => "card-header",
                    ]
                ) .
                html_writer::tag(
                    "div",
                    html_writer::tag("div", $html, [
                        "class" => "card-body",
                    ]),
                    ["id" => "collapse".$id , "class" => "collapse ".($isOpen ? "show" : "")]
                ),
                ["class" => "card"]
            ),
            ["id" => "accordion" , 'class' => "mb-3"]
        );
        return $string;
    }
}
