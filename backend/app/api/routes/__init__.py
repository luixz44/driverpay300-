from .auth import router as auth_router
from .users import router as users_router
from .vehicles import router as vehicles_router
from .rides import router as rides_router
from .expenses import router as expenses_router
from .obd2 import router as obd2_router
from .dashboard import dashboard_router, reports_router

# Criador de containers para empacotar as rotas exatamente como o main.py espera
class RouteContainer:
    def __init__(self, **kwargs):
        for chave, valor in kwargs.items():
            setattr(self, chave, valor)

auth = RouteContainer(router=auth_router)
users = RouteContainer(router=users_router)
vehicles = RouteContainer(router=vehicles_router)
rides = RouteContainer(router=rides_router)
expenses = RouteContainer(router=expenses_router)
obd2 = RouteContainer(router=obd2_router)

# Container do dashboard contendo as duas rotas necessárias
dashboard = RouteContainer(dashboard_router=dashboard_router, reports_router=reports_router)
