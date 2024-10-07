import  {  Config,  getFunctions,  getSchemaCreator  }  from  "nobox-client";
import nomineeListProd from '@/data/nominees_prod.json';
import nomineeListDev from '@/data/nominees_dev.json';


const project =  process.env.NEXT_PUBLIC_NOBOX_PROJECT || process.env.NOBOX_PROJECT;
const token = process.env.NEXT_PUBLIC_NOBOX_TOKEN || process.env.NOBOX_TOKEN;

const uploadApi = process.env.NEXT_PUBLIC_NOBOX_UPLOAD_API;
const UPLOAD_TOKEN = process.env.NEXT_PUBLIC_NOBOX_UPLOAD_CLIENT_TOKEN;
const RESEND_API_KEY = process.env.NEXT_PUBLIC_RESEND_API_KEY || process.env.RESEND_API_KEY;
const RESEND_SEND_MAIL = process.env.NEXT_PUBLIC_RESEND_SEND_MAIL || process.env.RESEND_SEND_MAIL;


if (!project) {
    throw new Error('Project not specified')
}

if (!token) {
    throw new Error('Token not specified')
}

if (!uploadApi) {
    throw new Error('uploadApi not specified')
}
if (!UPLOAD_TOKEN) {
    throw new Error('UPLOAD_TOKEN not specified')
}
if (!RESEND_SEND_MAIL) {
    throw new Error('RESEND_SEND_MAIL not specified')
}

if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY not specified')
}

export const upload_server_api = uploadApi;
export const upload_server_token = UPLOAD_TOKEN;
export const send_api_key = RESEND_API_KEY;
export const send_mail = RESEND_SEND_MAIL;
export const config: Config = {
    endpoint:  process.env.NEXT_PUBLIC_NOBOX_API || "https://api.nobox.cloud",
    project, token
};

export const nominee = process.env.NODE_ENV === 'development' ? nomineeListDev : nomineeListProd;

export const createRowSchema = getSchemaCreator(config, { type: "rowed" });

// export const createKeyGroupSchema = getSchemaCreator(config, { type: "key-group" });

export  const  Nobox  =  getFunctions(config);
