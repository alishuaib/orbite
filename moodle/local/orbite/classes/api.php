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

namespace local_orbite;

defined('MOODLE_INTERNAL') || die();

require_once($CFG->dirroot . '/lib/filestorage/file_system.php');
class api
{
    /** @var string endpoint url. */
    protected static $endpoint = "http://172.29.71.252:3000/api/plugin/moodle";

    /**
     * Standard POST request to Orbite API
     *
     * @param string $route
     * @param array $body
     * @return mixed
     */
    public static function post_request(string $route, array $body = [])
    {
        $api_key = get_config('local_orbite', 'setapikey');
        $url = self::$endpoint . $route;

        $validate = self::validate_api_key($api_key);
        if (!$validate) return $validate;

        $curl = curl_init();
        curl_setopt_array($curl, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($body),
            CURLOPT_HTTPHEADER => [
                "Content-Type: application/json",
                "X-ORBITE-API-KEY: " . $api_key
            ],
            CURLOPT_TIMEOUT => 60
        ]);

        $response = curl_exec($curl);
        $err = curl_error($curl);
        curl_close($curl);

        try {
            return json_decode($response);
        } catch (\Throwable $th) {
            return (object) array(
                'route'=> $url,
                'isSuccess' => false,
                'message' => "Orbite API Error",
                'data' => $response ?? $err
            );
        }
    }

    /**
     * Formdata request to Orbite servers
     *
     * @param string $route
     * @param array $body
     * @param array $files
     * @return mixed
     */
    public static function form_request(string $route, array $body = [], array $files = [])
    {
        
        $api_key = get_config('local_orbite', 'setapikey');
        $url = self::$endpoint . $route;
        
        $validate = self::validate_api_key($api_key);
        if (!$validate) return (object) array(
            'route'=> $url,
            'isSuccess' => false,
            'message' => "API Key validation failed",
            'data' => $validate
        );

        $postData = ['body' => json_encode($body)];

        $fs = get_file_storage();
        $filesystem = $fs->get_file_system();
        foreach ($files as $i => $f) {
            $path = $filesystem->get_local_path_from_storedfile($f, true);
            $postData["file[" . $i . "]"] = curl_file_create(
                $path,
                $f->get_mimetype(),
                $f->get_filename()
            );
        }

        $curl = curl_init();
        curl_setopt_array($curl, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $postData,
            CURLOPT_HTTPHEADER => [
                "Content-Type: multipart/form-data",
                "X-ORBITE-API-KEY: " . $api_key
            ],
            CURLOPT_TIMEOUT => 300 // Longer for file uploads may be needed
        ]);


        $response = curl_exec($curl);
        $err = curl_error($curl);
        curl_close($curl);

        try {
            return json_decode($response);
        } catch (\Throwable $th) {
            return (object) array(
                'route'=> $url,
                'isSuccess' => false,
                'message' => "Orbite API Error",
                'data' => $response ?? $err
            );
        }
    }

    public static function footer(string $page='isSettings'){
        $context = (object)[
            'server_status'=>'',
            'api_status'=> '',
            'plugin_version'=>get_config('local_orbite')->version,
            'plugin_status'=>'',
            'isSettings'=>$page=='isSettings'?'hidden':'',
            'isSync'=>$page=='isSync'?'hidden':'',
            'isQueue'=>$page=='isQueue'?'hidden':'',
            'admin'=>'',
            'docs'=>'',
            'new'=>'',
            'help'=>'',
            'expire'=>'',
            'showExpire'=>$page!='isSettings'?'hidden':'',
        ];

        $api_key = get_config('local_orbite', 'setapikey');
        $validate = self::validate_api_key($api_key);
        if (!$validate) {
            $context -> server_status = '<i class="fa fa-circle-o-notch text-secondary"></i> ' . $validate==null?'API_KEY not set':'Invalid API_KEY length';
            $context -> api_status = '<i class="fa fa-circle-o-notch text-secondary"></i> ' . $validate==null?'API_KEY not set':'Invalid API_KEY length';
        };
        
        $response = $validate ? self::post_request('/status') : null;
        if ($response && $response -> isSuccess) {
            $context -> admin = $response -> data -> urls -> admin;
            $context -> docs = $response -> data -> urls -> docs;
            $context -> new = $response -> data -> urls -> new;
            $context -> help = $response -> data -> urls -> help;
            switch ($response -> data -> server) {
                case 'live':
                    $context -> server_status = '<i class="fa fa-circle-o-notch fa-spin text-success"></i> '. 'File Sync Live';
                    break;
                case 'maintenance':
                    $context -> server_status = '<i class="fa fa-cog fa-spin text-warning"></i> '. 'File Sync Maintenance';
                    break;
                case 'down':
                    $context -> server_status = '<i class="fa fa-cog text-danger"></i> '. 'File Sync Down';
                    break;
                default:
                    $context -> server_status = '<i class="fa fa-cog fa-spin text-secondary"></i> '. 'Server Maintenance';
                    break;
            }
            switch ($response -> data -> api) {
                case 'live':
                    $context -> api_status = '<i class="fa fa-circle-o-notch fa-spin text-success"></i> '. 'AI/Chat Live';
                    break;
                case 'maintenance':
                    $context -> api_status = '<i class="fa fa-cog fa-spin text-warning"></i> '. 'AI/Chat Maintenance';
                    break;
                case 'down':
                    $context -> api_status = '<i class="fa fa-cog text-danger"></i> '. 'AI/Chat Down';
                    break;
                default:
                    $context -> api_status = '<i class="fa fa-cog fa-spin text-secondary"></i> '. 'Server Maintenance';
                    break;
            }
            switch ($response -> data -> plugin) {
                case ($response -> data -> plugin > $context -> plugin_version):
                    $context -> plugin_status = '<i class="fa fa-external-link-square text-info"></i> '.'New Version Available ';
                    break;   
                case ($response -> data -> plugin <= $context -> plugin_version):
                    $context -> plugin_status = '<i class="fa fa-check-square text-success"></i> '.'Up to date';
                    break;               
                default:
                    $context -> plugin_status = ''.'Check Later';
                    break;
            }
            // $context -> expire = $response -> data -> expire;
            if (!is_numeric($response -> data -> expire)){
                $context -> showExpire = 'hidden';
                // \core\notification::info('Your temporary API_KEY expires on ['. date('F j, Y h:i A T', intval($context->expire)) .']');
            }else{
                $context -> expire = 'Your temporary API_KEY expires on ['. date('F j, Y h:i A T', intval($response -> data -> expire)) .']';
            }
        } else {
            $context -> server_status = '<i class="fa fa-cog fa-spin text-secondary"></i> '. 'Server Maintenance';
            $context -> api_status = '<i class="fa fa-cog fa-spin text-secondary"></i> '.'Server Maintenance';
            $context -> plugin_status = ''.'Check Later';
            $context -> showExpire = 'hidden';
            if ($page == 'isSettings'){
                \core\notification::error($response);
            }
        }

        global $OUTPUT;
        $html = $OUTPUT->render_from_template('local_orbite/footer', $context);

        return $html;
    }

    /**
     * Validation for API_KEY
     *
     * @param string $api_key
     * @return null|false|true
     */
    protected static function validate_api_key(string $api_key)
    {
        if (!$api_key || $api_key == '') {
            return null; // API_KEY not set
        } else if (strlen($api_key) < 36) {
            return false; //Invalid API_KEY length
        }
        return true; //Valid API_KEY
    }
}
