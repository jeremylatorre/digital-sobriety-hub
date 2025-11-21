migrate((db) => {
    const collection = new Collection({
        "id": "assessments_col",
        "created": "2025-11-20 12:00:00.000Z",
        "updated": "2025-11-20 12:00:00.000Z",
        "name": "assessments",
        "type": "base",
        "system": false,
        "schema": [
            {
                "system": false,
                "id": "assessments_user",
                "name": "user",
                "type": "relation",
                "required": true,
                "unique": false,
                "options": {
                    "collectionId": "_pb_users_auth_",
                    "cascadeDelete": true,
                    "minSelect": null,
                    "maxSelect": 1,
                    "displayFields": []
                }
            },
            {
                "system": false,
                "id": "assessments_name",
                "name": "project_name",
                "type": "text",
                "required": true,
                "unique": false,
                "options": {
                    "min": null,
                    "max": null,
                    "pattern": ""
                }
            },
            {
                "system": false,
                "id": "assessments_desc",
                "name": "project_description",
                "type": "text",
                "required": false,
                "unique": false,
                "options": {
                    "min": null,
                    "max": null,
                    "pattern": ""
                }
            },
            {
                "system": false,
                "id": "assessments_resp",
                "name": "responses",
                "type": "json",
                "required": false,
                "unique": false,
                "options": {}
            },
            {
                "system": false,
                "id": "assessments_score",
                "name": "score",
                "type": "json",
                "required": false,
                "unique": false,
                "options": {}
            },
            {
                "system": false,
                "id": "assessments_status",
                "name": "status",
                "type": "select",
                "required": false,
                "unique": false,
                "options": {
                    "maxSelect": 1,
                    "values": [
                        "draft",
                        "completed"
                    ]
                }
            },
            {
                "system": false,
                "id": "assessments_ref",
                "name": "referential_id",
                "type": "text",
                "required": false,
                "unique": false,
                "options": {
                    "min": null,
                    "max": null,
                    "pattern": ""
                }
            }
        ],
        "indexes": [],
        "listRule": "user = @request.auth.id",
        "viewRule": "user = @request.auth.id",
        "createRule": "@request.auth.id != \"\"",
        "updateRule": "user = @request.auth.id",
        "deleteRule": "user = @request.auth.id",
        "options": {}
    });

    return Dao(db).saveCollection(collection);
}, (db) => {
    const dao = new Dao(db);
    const collection = dao.findCollectionByNameOrId("assessments");

    return dao.deleteCollection(collection);
})
