import './App.css';
import HomePage from './Pages/HomePage/HomePage';
import RegisterPage from './Pages/RegisterPage/RegisterPage';
import LoginPage from './Pages/LoginPage/LoginPage';
import DashboardPage from './Pages/Dashboardpage/DashboardPage';
import AdminDashboard from './Pages/AdminDashboard/AdminDashboard';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className='App'>
      <BrowserRouter>
        <Routes>
          <Route exact path='/' element={<HomePage/>}/>
          <Route exact path='/register' element={<RegisterPage/>}/>
          <Route exact path='/login' element={<LoginPage/>}/>
          <Route exact path='/user-dashboard' element={<DashboardPage/>}/>
          <Route exact path='/admin-dashboard' element={<AdminDashboard/>}/>
        </Routes>
      </BrowserRouter>     
    </div>
  );
}

export default App;