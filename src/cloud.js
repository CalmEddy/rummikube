import {createClient} from '@supabase/supabase-js';
import {loadScorebook,saveScorebook} from './cloud-store.js';
const url=import.meta.env.VITE_SUPABASE_URL;
const key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||import.meta.env.VITE_SUPABASE_ANON_KEY;
let client=null,configurationError='';
try {if(url&&key){if(key.startsWith('sb_secret_'))throw Error();if(key.split('.').length===3){const payload=JSON.parse(atob(key.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));if(payload.role==='service_role')throw Error();}client=createClient(url,key);}}catch {configurationError='Supabase configuration is invalid. Check the project URL and publishable key.';}
export const cloud={client,configurationError,session:null,book:null,books:[],busy:false,error:'',pending:false};
export async function listBooks(){const {data,error}=await client.from('scorebooks').select('id,name').order('name');if(error)throw error;cloud.books=data;return data;}
export async function openBook(id){const book=await loadScorebook(client,id);cloud.book=book;localStorage.setItem('tile-tally-book-'+cloud.session.user.id,id);return structuredClone(book.data);}
export async function persistBook(data){cloud.book=await saveScorebook(client,cloud.book,structuredClone(data));}
