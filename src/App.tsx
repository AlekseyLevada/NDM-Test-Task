import React from 'react';
import RoutesTable from './components/RoutesTable/RoutesTable';
import styles from './App.module.css';

function App() {
  return (
    <div className={styles.app}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Маршрутизация сети</h1>
          <p className={styles.subtitle}>Таблица действующих маршрутов IPv4</p>
        </header>
        <RoutesTable />
      </div>
    </div>
  );
}

export default App;