const PROJECT_ID = 'skill-dsa';
const username = 'krishna1156'; // From the screenshot
const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`;
const body = {
    structuredQuery: {
        from: [{ collectionId: 'codes' }],
        where: {
            fieldFilter: {
                field: { fieldPath: 'username' },
                op: 'EQUAL',
                value: { stringValue: username }
            }
        },
        orderBy: [
            {
                field: { fieldPath: 'timestamp' },
                direction: 'DESCENDING'
            }
        ],
        limit: 50
    }
};

fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
})
    .then(async res => {
        console.log("Status:", res.status);
        console.log(await res.text());
    })
    .catch(console.error);
