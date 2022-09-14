import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebase";

export default function handler(req: any, res: any) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/xml");

  // Instructing the Vercel edge to cache the file
  res.setHeader("Cache-control", "stale-while-revalidate, s-maxage=3600");

  // generate sitemap here
  const baseUrl = "https://finnfasit.no";

  async function getUrls() {
    const querySnapshot = await getDocs(collection(db, "verifiedUploads"));
    const querySnapshotSubjects = await getDocs(collection(db, "subjects"));

    const documents: any = [];
    const subjects: any = [];
    const staticPages = ["", "dokumenter", "logg-inn", "registrer-deg"];
    querySnapshot.forEach((doc) => {
      documents.push({
        _id: doc.id,
        subject: doc.data().subject,
        created: doc.data().created,
        filePath: doc.data().filePath,
      });
    });
    querySnapshotSubjects.forEach((doc) => {
      subjects.push(doc.data().value);
    });
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${staticPages
          .map((url: any) => {
            return `
              <url>
                <loc>${baseUrl}/${url}</loc>
                  <changefreq>yearly</changefreq>
                  <priority>0.5</priority>
              </url>
              `;
          })
          .join("")}

          ${subjects
            .map((subject: any) => {
              return `
                <url>
                  <loc>${baseUrl}/dokumenter/${subject}</loc>
                    <changefreq>monthly</changefreq>
                    <priority>0.5</priority>
                </url>
                `;
            })
            .join("")}
          
          ${documents
            .map((item: any) => {
              return `
                <url>
                    <loc>${baseUrl}/dokumenter/${item.filePath}/${
                item._id
              }</loc>
                    <lastmod>${
                      item.created ? item.created.toDate().toISOString() : null
                    }</lastmod>
                    <changefreq>yearly</changefreq>
                    <priority>1.0</priority>
                </url>
                `;
            })
            .join("")}
        </urlset>
      `;
    if (documents.length != 0) {
      res.status(200).send(sitemap);
      return;
    }
  }
  getUrls();
}
