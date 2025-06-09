import './RoutesTable.css';
import React, { useState } from 'react';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { useObservable } from 'rxjs-hooks';
import ip from 'ip-address';

interface Route {
  uuid: string;
  address: string;
  mask: string;
  gateway: string;
  interface: string;
}

const initialRoutes: Route[] = [
  { uuid: '1', address: '0.0.0.0', mask: '0', gateway: '193.0.174.1', interface: 'Подключение Ethernet' },
  { uuid: '2', address: '10.1.30.0', mask: '24', gateway: '0.0.0.0', interface: 'Гостовая сеть' },
  { uuid: '3', address: '192.168.1.0', mask: '24', gateway: '0.0.0.0', interface: 'Домашняя сеть' },
  { uuid: '4', address: '193.0.174.0', mask: '24', gateway: '0.0.0.0', interface: 'Подключение Ethernet' },
  { uuid: '5', address: '193.0.175.0', mask: '25', gateway: '193.0.174.10', interface: 'Подключение Ethernet' },
  { uuid: '6', address: '193.0.175.2', mask: '32', gateway: '193.0.174.1', interface: 'Подключение Ethernet' },
  { uuid: '7', address: '172.16.0.0', mask: '16', gateway: '0.0.0.0', interface: 'Рабочая сеть' },
  { uuid: '8', address: '10.0.0.0', mask: '8', gateway: '10.0.0.1', interface: 'Корпоративная сеть' },
];

const routesSubject = new BehaviorSubject<Route[]>(initialRoutes);
const sortSubject = new BehaviorSubject<{ field: keyof Route | null; direction: 'asc' | 'desc' }>({
  field: null,
  direction: 'asc',
});

const compareIps = (a: string, b: string): number => {
  try {
    const ipA = new (ip as any).Address4(a);
    const ipB = new (ip as any).Address4(b);
    return ipA.bigInteger().compare(ipB.bigInteger());
  } catch {
    return a.localeCompare(b);
  }
};

const compareAddressWithMask = (a: Route, b: Route): number => {
  const addressComparison = compareIps(a.address, b.address);
  if (addressComparison !== 0) return addressComparison;
  return parseInt(a.mask) - parseInt(b.mask);
};


const RoutesTable: React.FC = () => {
  const [sortConfig, setSortConfig] = useState<{ field: keyof Route | null; direction: 'asc' | 'desc' }>({
    field: null,
    direction: 'asc',
  });

  const sortedRoutes = useObservable(() =>
    combineLatest([routesSubject, sortSubject]).pipe(
      map(([routes, sort]) => {
        if (!sort.field) return routes;

        return [...routes].sort((a, b) => {
          let comparison = 0;

          switch (sort.field) {
            case 'address':
              comparison = compareAddressWithMask(a, b);
              break;
            case 'gateway':
              comparison = compareIps(a.gateway, b.gateway);
              break;
            case 'interface':
              comparison = a.interface.localeCompare(b.interface);
              break;
            default:
              return 0;
          }

          return sort.direction === 'asc' ? comparison : -comparison;
        });
      })
    ),
    initialRoutes
  );

  const handleSort = (field: keyof Route) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.field === field && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    const newSortConfig = { field, direction };
    setSortConfig(newSortConfig);
    sortSubject.next(newSortConfig);
  };

  const getSortIndicator = (field: keyof Route) => {
    if (sortConfig.field !== field) return null;
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const formatAddress = (route: Route) => {
    return `${route.address}/${route.mask}`;
  };

  return (
    <div className="routes-table">
      <h2>Действующие маршруты IPv4</h2>
      <table>
        <thead>
          <tr>
            <th onClick={() => handleSort('address')}>
              Адрес назначения {getSortIndicator('address')}
            </th>
            <th onClick={() => handleSort('gateway')}>
              Шлюз {getSortIndicator('gateway')}
            </th>
            <th onClick={() => handleSort('interface')}>
              Интерфейс {getSortIndicator('interface')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedRoutes.map((route) => (
            <tr key={route.uuid}>
              <td>{formatAddress(route)}</td>
              <td>{route.gateway}</td>
              <td>{route.interface}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RoutesTable;