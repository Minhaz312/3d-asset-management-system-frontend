import logo from './logo.svg';
import './App.css';
import AssetList from './pages/AssetList';

import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Modify from './pages/Modify';
import CreateModel from './pages/CreateModel';
import AssetRegistration from './pages/AssetRegistration';
import MassRegistration from './pages/MassRegistration';
import Login from './pages/Login';
import Signup from './pages/Signup';
import {UserProvider} from './contexts/userContext';
import Home from './pages/Home';
import { TypeProvider } from './contexts/typeContext';

function App() {
  return (
    <TypeProvider>
    <UserProvider>
      <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/home' element={<Home />} />
        <Route path='/create-account' element={<Signup />} />
        <Route path='/asset-list' element={<AssetList />} />
        <Route path='/registration/individual' element={<AssetRegistration />} />
        <Route path='/registration/mass' element={<MassRegistration />} />
        <Route path='/create-model' element={<CreateModel />} />
        <Route path='/modify/:modelId' element={<Modify />} />
      </Routes>
    </BrowserRouter>
    </UserProvider>
    </TypeProvider>
    // <AssetList />
  );
}

export default App;
