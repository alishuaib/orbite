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
 * Course API
 *
 * @package    local_orbite
 * @copyright  Ali Shuaib
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_orbite\api;

class _schema{
    protected $schema = null;
    public function __construct(object $course)
    {
        $this -> schema = array(            
            'course' => array(
                'id'=>(int)$course->id,
                'title'=>$course->fullname,
                'label'=>$course->shortname,
                'summary'=>$course->summary,
                'visible'=>$course->visible == "1" ? true : false,
                'url'=>$course->url,
                // 'namespace'=>,
                'category'=>$course->category_name,
                'tags'=>implode(",",array_map(function($i){return $i->name;},$course->tags)),
                'version'=>$course->timemodified,
                'meta'=>$course
            )         
        );
    }

    public function read(){
        return $this -> schema;
    }
}

class course{
    public static function builder(object $course){
        return new _schema($course);
    }

    public static function patch(_schema $body){
        $response = \local_orbite\api::post_request("/course?method=PATCH", $body -> read());
        return $response;
    }

    public static function delete(string $id){
        $response = \local_orbite\api::post_request("/course?method=DELETE", array(
            'course' => array(
                'id'=>[(int)$id],
            ),
        ), []);
        return $response;
    }
}