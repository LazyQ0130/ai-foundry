import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './style.css';

const root = document.getElementById('root');
if (!root) throw new Error('P1 页面缺少 root 节点。');
createRoot(root).render(<StrictMode><App /></StrictMode>);
