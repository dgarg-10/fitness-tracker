import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()
supa_url = os.getenv("SUPABASE_URL")
supa_service_key = os.getenv("SUPABASE_SERVICE_KEY")

supabase: Client = create_client(supa_url, supa_service_key)