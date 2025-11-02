import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Explore from './pages/Explore';
import FindWork from './pages/FindWork';
import About from './pages/About';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProfilePage from './pages/Profile';
import PostJob from './pages/PostJob';
import JobDetails from "./pages/JobDetails";
import YouApplied from "./pages/YouApplied";

function App() {
  return (
      <Routes>
        <Route path="/" element={<Explore />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/find-work" element={<FindWork />} />
        <Route path="/about" element={<About />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/profile" element={<ProfilePage />} /> 
        <Route path="/post-job" element={<PostJob />} />
        <Route path="/job/:id" element={<JobDetails />} />
        <Route path="/you-applied" element={<YouApplied />} />
      </Routes>
  );
}

export default App;