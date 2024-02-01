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
 * Content API
 *
 * @package    local_orbite
 * @copyright  Ali Shuaib
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_orbite\api;

class _schema{
    protected $schema = null;
    public function __construct(object $course,object $section,object $module,array $content)
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
            ),
            'section' => array(
                'id'=>(int)$section->id,
                'title'=>$section->name == null ? "Topic ".$section->section : $section->name,
                'summary'=>$section->summary,
                'order'=>$section->section,
                'sequence'=>$section->sequence,
                'visible'=>$section->visible == "1" ? true : false,
                'url'=>$section->url,
                'version'=>$section->timemodified,
                'meta'=>$section
            ),
            'module' => array(
                'id'=>(int)$module->id,
                'title'=>$module->name,
                'summary'=>$module->intro,
                'visible'=>$module->visible == "1" ? true : false,
                'url'=>$module->url,
                'version'=>$module->timemodified,
                'meta'=>$module              
            ),
            'content' => array_map(
                function($item){
                    return array(
                        'id'=>(int)$item->id,
                        'name'=>$item->filename,
                        'ext'=>explode(".",$item->filename)[count(explode(".",$item->filename))-1],
                        'visible'=>true,
                        'size'=>(int)$item->filesize,
                        'mimetype'=>$item->mimetype,
                        'created_at'=>$item->timecreated,
                        'url'=>$item->url,
                        'version'=>$item->timemodified,
                        'meta'=>$item
                    );
                },
                $content
            )            
        );
    }

    public function read(){
        return $this -> schema;
    }
}

class content{
    public static function builder(object $course,object $section,object $module,array $content){
        return new _schema($course,$section,$module,$content);
    }

    public static function get(string $id){
        $response = \local_orbite\api::form_request("/content?method=GET", array(
            'content' => array(
                'id'=>[(int)$id],
            ),
        ), []);
        return $response;
    }

    public static function post(_schema $body,array $files){
        $response = \local_orbite\api::form_request("/content?method=POST", $body -> read() , $files);
        return $response;
    }

    public static function patch(_schema $body,array $files){
        $response = \local_orbite\api::form_request("/content?method=PATCH", $body -> read() , $files);
        return $response;
    }

    public static function delete(string $id){
        $response = \local_orbite\api::form_request("/content?method=DELETE", array(
            'content' => array(
                'id'=>[(int)$id],
            ),
        ), []);
        return $response;
    }
}