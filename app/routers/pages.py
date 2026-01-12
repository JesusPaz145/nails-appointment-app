from fastapi import APIRouter, Request, Depends
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse

router = APIRouter(include_in_schema=False) # Don't show in Swagger

templates = Jinja2Templates(directory="app/templates")

@router.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@router.get("/register", response_class=HTMLResponse)
async def register_page(request: Request):
    return templates.TemplateResponse("register.html", {"request": request})

@router.get("/mis-citas", response_class=HTMLResponse)
async def citas_page(request: Request):
    return templates.TemplateResponse("mis-citas.html", {"request": request})

@router.get("/servicios", response_class=HTMLResponse)
async def servicios_page(request: Request):
    # We could fetch services here and pass to template, or let frontend fetch.
    # Frontend fetch is consistent with other pages.
    # For now, reuse index or a services page? User didn't ask explicitly but "reservar cita" goes to steps.
    # I'll just redirect to home or show a placeholder. 
    # Or create a services.html if I had time.
    # Given instructions, I'll just render a basic page or index.
    return templates.TemplateResponse("servicios.html", {"request": request}) 

@router.get("/admin", response_class=HTMLResponse)
async def admin_page(request: Request):
    return templates.TemplateResponse("admin.html", {"request": request}) 

@router.get("/", response_class=HTMLResponse)
async def home_page(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})
