import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import path from 'path';

const serviceAccountPath = path.join(__dirname, '../../../firebase-key.json');
//Carga las credenciales de Firebase desde el archivo JSON

const serviceAccount = JSON.parse(
    readFileSync(serviceAccountPath, 'utf8')
);

console.log(serviceAccount.project_id);
console.log("Service account loaded:", serviceAccount.client_email);
//Inicializa la aplicación de Firebase con las credenciales
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});
console.log("Project:", admin.app().options.projectId);



const db = admin.firestore();

export default db;