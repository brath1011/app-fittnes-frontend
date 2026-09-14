import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { RegistroComponent } from './registro/registro';
import { InicioComponent } from './inicio/inicio';
import { EjerciciosComponent } from './ejercicios/ejercicios';
import { RutinasComponent } from './rutinas/rutinas';
import { EntrenamientoComponent } from './entrenamiento/entrenamiento';
import { EntrenamientoHubComponent } from './entrenamiento-hub/entrenamiento-hub';
import { PagosComponent } from './pagos/pagos';
import { CursosComponent } from './cursos/cursos';
import { PerfilComponent } from './perfil/perfil';
import { AdminLayoutComponent } from './admin-layout/admin-layout';
import { AdminEjerciciosComponent } from './admin-ejercicios/admin-ejercicios';
import { AdminPagosComponent } from './admin-pagos/admin-pagos';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'rutinas', pathMatch: 'full' },
  { path: 'rutinas', component: RutinasComponent, canActivate: [authGuard] },
  { path: 'inicio', component: InicioComponent },
  { path: 'entrenamiento', component: EntrenamientoHubComponent, canActivate: [authGuard] },
  { path: 'entrenamiento/:id', component: EntrenamientoComponent, canActivate: [authGuard] },
  { path: 'ejercicios', component: EjerciciosComponent },
  { path: 'cursos', component: CursosComponent, canActivate: [authGuard] },
  { path: 'pagos', component: PagosComponent, canActivate: [authGuard] },
  { path: 'perfil', component: PerfilComponent, canActivate: [authGuard] },
  { 
    path: 'admin', 
    component: AdminLayoutComponent, 
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'ejercicios', component: AdminEjerciciosComponent },
      { path: 'pagos', component: AdminPagosComponent }
    ]
  },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'terminos', loadComponent: () => import('./terminos/terminos').then(m => m.TerminosComponent) },
  { path: 'politicas', loadComponent: () => import('./politicas/politicas').then(m => m.PoliticasComponent) },
  { path: '**', redirectTo: 'rutinas' }
];
