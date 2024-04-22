const Koa = require("koa");
const Router = require("koa-router");
//const Excel = require("exceljs");
const { koaBody } = require("koa-body");
const XLSX = require("xlsx");
const knex = require("knex");
const knexconfig = require("./knexfile");

const app = new Koa();
const router = new Router();

//Multipart to support excel reading unlike body-parser
app.use(koaBody({ multipart: true }));

//DB CONNECTION
const db = knex(knexconfig.development);


//POST API 
router.post("/upload", async (ctx) => {
  const filePath = ctx.request.files.file.filepath;

  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const exceldata = XLSX.utils.sheet_to_json(worksheet);
    //console.log(exceldata);

    // const users=await db.select().from('Burner')
    //ctx.body = data;
    function insertfunction(row) {
      const sitemasterdevicedata = db.select().from("site_master_devices");
      //   console.log("--------");
      //   console.log(row);

      knex("site_master_devices")
        .insert(exceldata)
        .returning("*")
        .then((data) => {
          console.log("Inserted data:", data);
        });
    }

    exceldata.map(insertfunction);

    //ctx.body = data;
  } catch (err) {
    ctx.body = err;
  }
});

app.use(router.routes()).use(router.allowedMethods());//Tells koa to use routing functionality provided by router and handles unsupported http methods



app.listen(3000, () => {
  console.log("Server running on port 3000");
});
