## Event Body Sample Schemas

### Course Schemas

<details>
<summary>Create</summary>

```json
{
	"event": {
		"eventname": "\\core\\event\\course_created",
		"component": "core",
		"action": "created",
		"target": "course",
		"objecttable": "course",
		"objectid": "3",
		"crud": "c",
		"edulevel": 1,
		"contextid": 16,
		"contextlevel": 50,
		"contextinstanceid": "3",
		"userid": "2",
		"courseid": "3",
		"relateduserid": null,
		"anonymous": 0,
		"other": {
			"shortname": "mooo",
			"fullname": "moooooooodle Course"
		},
		"timecreated": 1698872103
	},
	"data": {
		"course": {
			"id": "3",
			"category": "1",
			"sortorder": "10001",
			"fullname": "moooooooodle Course",
			"shortname": "mooo",
			"idnumber": "",
			"summary": "<p>AbC</p>",
			"summaryformat": "1",
			"format": "topics",
			"showgrades": "1",
			"newsitems": "5",
			"startdate": "1698883200",
			"enddate": "1730419200",
			"relativedatesmode": "0",
			"marker": "0",
			"maxbytes": "0",
			"legacyfiles": "0",
			"showreports": "0",
			"visible": "1",
			"visibleold": "1",
			"downloadcontent": null,
			"groupmode": "0",
			"groupmodeforce": "0",
			"defaultgroupingid": "0",
			"lang": "",
			"calendartype": "",
			"theme": "",
			"timecreated": "1698872103",
			"timemodified": "1698872103",
			"requested": "0",
			"enablecompletion": "1",
			"completionnotify": "0",
			"cacherev": "0",
			"originalcourseid": null,
			"showactivitydates": "1",
			"showcompletionconditions": "1",
			"pdfexportfont": null,
			"category_name": "Category 1"
		}
	}
}
```

</details>

<details>
<summary>Update</summary>

```json
{
	"event": {
		"eventname": "\\core\\event\\course_updated",
		"component": "core",
		"action": "updated",
		"target": "course",
		"objecttable": "course",
		"objectid": "12",
		"crud": "u",
		"edulevel": 1,
		"contextid": 305,
		"contextlevel": 50,
		"contextinstanceid": "12",
		"userid": "2",
		"courseid": "12",
		"relateduserid": null,
		"anonymous": 0,
		"other": {
			"shortname": "123",
			"fullname": "123",
			"updatedfields": {
				"tags": ["Tag1", "tag2"]
			}
		},
		"timecreated": 1691520867
	},
	"data": {
		"course": {
			"id": "12",
			"category": "3",
			"sortorder": "10001",
			"fullname": "123",
			"shortname": "123",
			"idnumber": "",
			"summary": "<p>Description is here</p>",
			"summaryformat": "1",
			"format": "topics",
			"showgrades": "1",
			"newsitems": "5",
			"startdate": "1691535600",
			"enddate": "1723071600",
			"relativedatesmode": "0",
			"marker": "0",
			"maxbytes": "0",
			"legacyfiles": "0",
			"showreports": "0",
			"visible": "1",
			"visibleold": "1",
			"downloadcontent": null,
			"groupmode": "0",
			"groupmodeforce": "0",
			"defaultgroupingid": "0",
			"lang": "",
			"calendartype": "",
			"theme": "",
			"timecreated": "1691519646",
			"timemodified": "1691520867",
			"requested": "0",
			"enablecompletion": "1",
			"completionnotify": "0",
			"cacherev": "1691520867",
			"originalcourseid": null,
			"showactivitydates": "1",
			"showcompletionconditions": "1",
			"pdfexportfont": null
		},
		"category": {
			"Category 1": {
				"name": "Category 1",
				"description": "",
				"visible": "1"
			}
		},
		"tags": [
			{
				"tag1": {
					"name": "tag1",
					"description": null
				}
			},
			{
				"tag2": {
					"name": "tag2",
					"description": null
				}
			}
		]
	}
}
```

</details>

<details>
<summary>Delete</summary>

```json
{
	"event": {
		"eventname": "\\core\\event\\course_deleted",
		"component": "core",
		"action": "deleted",
		"target": "course",
		"objecttable": "course",
		"objectid": "14",
		"crud": "d",
		"edulevel": 1,
		"contextid": 309,
		"contextlevel": 50,
		"contextinstanceid": "14",
		"userid": "2",
		"courseid": "14",
		"relateduserid": null,
		"anonymous": 0,
		"other": {
			"shortname": "cvbb",
			"fullname": "cvb",
			"idnumber": ""
		},
		"timecreated": 1691570565
	}
}
```

</details>

### Module Schemas

<details>
<summary>Create</summary>

```json
{
	"event": {
		"eventname": "\\core\\event\\course_section_created",
		"component": "core",
		"action": "created",
		"target": "course_section",
		"objecttable": "course_sections",
		"objectid": 101,
		"crud": "c",
		"edulevel": 1,
		"contextid": 319,
		"contextlevel": 50,
		"contextinstanceid": "19",
		"userid": "2",
		"courseid": "19",
		"relateduserid": null,
		"anonymous": 0,
		"other": {
			"sectionnum": 6
		},
		"timecreated": 1691574924
	},
	"data": {
		"section": {
			"course": "19",
			"section": 6,
			"summary": "",
			"summaryformat": "1",
			"sequence": "",
			"name": null,
			"visible": 1,
			"availability": null,
			"timemodified": 1691574924,
			"id": 101
		}
	}
}
```

</details>

<details>
<summary>Update</summary>

```json
{
	"event": {
		"eventname": "\\core\\event\\course_section_updated",
		"component": "core",
		"action": "updated",
		"target": "course_section",
		"objecttable": "course_sections",
		"objectid": "103",
		"crud": "u",
		"edulevel": 1,
		"contextid": 319,
		"contextlevel": 50,
		"contextinstanceid": "19",
		"userid": "2",
		"courseid": 19,
		"relateduserid": null,
		"anonymous": 0,
		"other": {
			"sectionnum": "6"
		},
		"timecreated": 1691575858
	},
	"data": {
		"section": {
			"id": "103",
			"course": "19",
			"section": "6",
			"name": "Section New",
			"summary": "",
			"summaryformat": "1",
			"sequence": "",
			"visible": "1",
			"availability": null,
			"timemodified": "1691575858"
		}
	}
}
```

</details>

<details>
<summary>Delete</summary>

```json
{
	"event": {
		"eventname": "\\core\\event\\course_section_deleted",
		"component": "core",
		"action": "deleted",
		"target": "course_section",
		"objecttable": "course_sections",
		"objectid": "114",
		"crud": "d",
		"edulevel": 1,
		"contextid": 323,
		"contextlevel": 50,
		"contextinstanceid": "21",
		"userid": "2",
		"courseid": "21",
		"relateduserid": null,
		"anonymous": 0,
		"other": {
			"sectionnum": "4",
			"sectionname": "Topic 4"
		},
		"timecreated": 1691576717
	}
}
```

</details>

### File Schemas

<details>
<summary>Create</summary>

This is formdata with a body and array of files.

```json
{
	"event": {
		"eventname": "\\core\\event\\course_module_created",
		"component": "core",
		"action": "created",
		"target": "course_module",
		"objecttable": "course_modules",
		"objectid": 223,
		"crud": "c",
		"edulevel": 1,
		"contextid": 360,
		"contextlevel": 70,
		"contextinstanceid": "223",
		"userid": "2",
		"courseid": "21",
		"relateduserid": null,
		"anonymous": 0,
		"other": {
			"modulename": "resource",
			"instanceid": 46,
			"name": "a45"
		},
		"timecreated": 1691596603
	},
	"data": {
		"module": {
			"id": "223",
			"course": "21",
			"module": "18",
			"instance": "46",
			"section": "111",
			"idnumber": "",
			"added": "1691596603",
			"score": "0",
			"indent": "0",
			"visible": "1",
			"visibleoncoursepage": "1",
			"visibleold": "1",
			"groupmode": "0",
			"groupingid": "0",
			"completion": "1",
			"completiongradeitemnumber": null,
			"completionview": "0",
			"completionexpected": "0",
			"completionpassgrade": "0",
			"showdescription": "0",
			"availability": null,
			"deletioninprogress": "0",
			"downloadcontent": "1",
			"lang": ""
		},
		"files": [
			{
				"id": "623",
				"contenthash": "b5d6c395b43e0170df78f1536505667a119f01a6",
				"pathnamehash": "6a9e424bab8cf424df1de0558c18f099e2dd39eb",
				"contextid": "360",
				"component": "mod_resource",
				"filearea": "content",
				"itemid": "0",
				"filepath": "/",
				"filename": "Documentation.docx",
				"userid": "2",
				"filesize": "778551",
				"mimetype": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
				"status": "0",
				"source": "Documentation.docx",
				"author": "Admin User",
				"license": "unknown",
				"timecreated": "1691596597",
				"timemodified": "1691596603",
				"sortorder": "1",
				"referencefileid": null
			}
		]
	},
	"url": "http://localhost:8000/mod/resource/view.php?id=223"
}
```

</details>

<details>
<summary>Update</summary>

```json

```

</details>

<details>
<summary>Delete</summary>

```json

```

</details>
