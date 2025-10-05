// import React, { useState, useEffect } from 'react';
// import { Bar, Line, Pie } from 'react-chartjs-2';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
//   ArcElement
// } from 'chart.js';

// // Register ChartJS components
// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
//   ArcElement
// );

// export default function AdminDashboard() {
//   // State for dashboard data
//   const [dashboardData, setDashboardData] = useState({
//     visitors: 0,
//     customers: 0,
//     products: 0,
//     orders: 0,
//     pendingOrders: 0,
//     shippingOrders: 0,
//     deliveredOrders: 0,
//     revenue: 0
//   });

//   // State for charts
//   const [topProducts, setTopProducts] = useState([]);
//   const [salesData, setSalesData] = useState({});
//   const [visitorData, setVisitorData] = useState({});
//   const [selectedMetric, setSelectedMetric] = useState('visitors');
//   const [revenueFilter, setRevenueFilter] = useState('month');

//   // ✅ New state for location filter
//   const [locationFilter, setLocationFilter] = useState("state");

//   // Dummy location data
//   const stateOrders = [
//     { name: "Kerala", orders: 23 },
//     { name: "Tamil Nadu", orders: 45 },
//     { name: "Karnataka", orders: 31 },
//   ];

//   const districtOrders = [
//     { name: "Saravanampatti", orders: 28 },
//     { name: "Thudiyalur", orders: 38 },
//     { name: "Peelamedu", orders: 19 },
//   ];

//   // Static product data
//   const products = [
//     { id: 1, name: 'Groundnut oil', likes: 124, sales: 342, price: 180 },
//     { id: 2, name: 'Coconut Oil', likes: 98, sales: 278, price: 220 },
//     { id: 3, name: 'Sesame Oil', likes: 87, sales: 195, price: 250 },
//     { id: 4, name: 'Castor Oil', likes: 65, sales: 132, price: 150 },
//     { id: 5, name: 'Arisi Murukku', likes: 156, sales: 420, price: 90 },
//     { id: 6, name: 'Raagi Murukku', likes: 142, sales: 380, price: 110 },
//     { id: 7, name: 'Ellu Urundai', likes: 132, sales: 325, price: 120 },
//     { id: 8, name: 'Thinai Laddu', likes: 121, sales: 310, price: 100 },
//     { id: 9, name: 'Kambu Laddu', likes: 115, sales: 290, price: 100 },
//     { id: 10, name: 'Raagi Laddu', likes: 135, sales: 345, price: 110 },
//     { id: 11, name: 'Karuppu Kavuni Laddu', likes: 95, sales: 210, price: 140 },
//     { id: 12, name: 'Athirasam', likes: 165, sales: 450, price: 80 },
//     { id: 13, name: 'Badam', likes: 145, sales: 320, price: 380 },
//     { id: 14, name: 'Pista', likes: 138, sales: 290, price: 450 },
//     { id: 15, name: 'Cashewnut', likes: 152, sales: 330, price: 420 },
//     { id: 16, name: 'Walnut', likes: 125, sales: 280, price: 350 },
//     { id: 17, name: 'Fig', likes: 118, sales: 260, price: 280 },
//     { id: 18, name: 'Honey Amla', likes: 105, sales: 230, price: 160 },
//     { id: 19, name: 'Dry Grapes', likes: 148, sales: 370, price: 200 },
//     { id: 20, name: 'Dates', likes: 162, sales: 410, price: 180 }
//   ];

//   // Generate dates from Aug 1, 2025 to today
//   const generateDateRange = () => {
//     const dates = [];
//     const startDate = new Date(2025, 7, 1); // Aug 1, 2025
//     const endDate = new Date();
    
//     for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
//       dates.push(new Date(date));
//     }
    
//     return dates;
//   };

//   // Initialize dashboard data
//   useEffect(() => {
//     // Simulate real-time data updates
//     const interval = setInterval(() => {
//       const updatedData = {
//         visitors: Math.floor(Math.random() * 1000) + 5000,
//         customers: Math.floor(Math.random() * 200) + 800,
//         products: products.length,
//         orders: Math.floor(Math.random() * 100) + 450,
//         pendingOrders: Math.floor(Math.random() * 20) + 15,
//         shippingOrders: Math.floor(Math.random() * 15) + 10,
//         deliveredOrders: Math.floor(Math.random() * 80) + 370,
//         revenue: Math.floor(Math.random() * 50000) + 150000
//       };
//       setDashboardData(updatedData);
//     }, 5000);

//     // Initial data
//     const initialData = {
//       visitors: 5243,
//       customers: 923,
//       products: products.length,
//       orders: 487,
//       pendingOrders: 23,
//       shippingOrders: 14,
//       deliveredOrders: 450,
//       revenue: 187432
//     };
//     setDashboardData(initialData);

//     // Set top 5 liked products
//     const sortedByLikes = [...products].sort((a, b) => b.likes - a.likes).slice(0, 5);
//     setTopProducts(sortedByLikes);

//     // Set sales data
//     const sortedBySales = [...products].sort((a, b) => b.sales - a.sales);
//     setSalesData({
//       labels: sortedBySales.map(product => product.name),
//       datasets: [
//         {
//           label: 'Units Sold',
//           data: sortedBySales.map(product => product.sales),
//           backgroundColor: 'rgba(75, 192, 192, 0.6)',
//           borderColor: 'rgba(75, 192, 192, 1)',
//           borderWidth: 1
//         },
//         {
//           label: 'Revenue (₹)',
//           data: sortedBySales.map(product => product.sales * product.price),
//           backgroundColor: 'rgba(153, 102, 255, 0.6)',
//           borderColor: 'rgba(153, 102, 255, 1)',
//           borderWidth: 1
//         }
//       ]
//     });

//     // Generate visitor/customer data
//     const dates = generateDateRange();
//     const visitorCounts = dates.map(() => Math.floor(Math.random() * 100) + 150);
//     const customerCounts = dates.map(() => Math.floor(Math.random() * 30) + 40);
    
//     setVisitorData({
//       labels: dates.map(date => date.toLocaleDateString()),
//       datasets: [
//         {
//           label: 'Visitors',
//           data: visitorCounts,
//           borderColor: 'rgb(255, 99, 132)',
//           backgroundColor: 'rgba(255, 99, 132, 0.5)',
//           tension: 0.1
//         },
//         {
//           label: 'Customers',
//           data: customerCounts,
//           borderColor: 'rgb(53, 162, 235)',
//           backgroundColor: 'rgba(53, 162, 235, 0.5)',
//           tension: 0.1
//         }
//       ]
//     });

//     return () => clearInterval(interval);
//   }, []);

//   // Filter visitor data based on selected metric
//   const filteredVisitorData = {
//     labels: visitorData.labels,
//     datasets: visitorData.datasets ? 
//       [visitorData.datasets.find(dataset => dataset.label.toLowerCase() === selectedMetric)] : []
//   };

//   // Orders by Location chart data
//   const locationData = {
//     labels: (locationFilter === "state" ? stateOrders : districtOrders).map(loc => loc.name),
//     datasets: [
//       {
//         data: (locationFilter === "state" ? stateOrders : districtOrders).map(loc => loc.orders),
//         backgroundColor: [
//           'rgba(75,192,192,0.6)',
//           'rgba(153,102,255,0.6)',
//           'rgba(255,159,64,0.6)',
//           'rgba(255,205,86,0.6)',
//           'rgba(54,162,235,0.6)',
//         ],
//         borderColor: [
//           'rgba(75,192,192,1)',
//           'rgba(153,102,255,1)',
//           'rgba(255,159,64,1)',
//           'rgba(255,205,86,1)',
//           'rgba(54,162,235,1)',
//         ],
//         borderWidth: 1,
//       }
//     ]
//   };

//   const barOptions = {
//     responsive: true,
//     plugins: {
//       legend: { position: 'top' },
//       title: { display: true, text: 'Product Sales Performance' },
//     },
//   };

//   const lineOptions = {
//     responsive: true,
//     plugins: {
//       legend: { position: 'top' },
//       title: { display: true, text: `${selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Over Time` },
//     },
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-6">
//       <h1 className="text-3xl font-bold text-green-800 mb-6">Admin Dashboard</h1>
      
//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
//           <h2 className="text-gray-500 text-sm font-semibold mb-2">Total Visitors</h2>
//           <p className="text-3xl font-bold text-green-700">{dashboardData.visitors}</p>
//         </div>
        
//         <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
//           <h2 className="text-gray-500 text-sm font-semibold mb-2">Total Customers</h2>
//           <p className="text-3xl font-bold text-blue-700">{dashboardData.customers}</p>
//         </div>
        
//         <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
//           <h2 className="text-gray-500 text-sm font-semibold mb-2">Total Products</h2>
//           <p className="text-3xl font-bold text-purple-700">{dashboardData.products}</p>
//         </div>
        
//         <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
//           <h2 className="text-gray-500 text-sm font-semibold mb-2">Total Orders</h2>
//           <p className="text-3xl font-bold text-yellow-700">{dashboardData.orders}</p>
//         </div>
        
//         <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
//           <h2 className="text-gray-500 text-sm font-semibold mb-2">Pending Orders</h2>
//           <p className="text-3xl font-bold text-orange-700">{dashboardData.pendingOrders}</p>
//         </div>
        
//         <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500">
//           <h2 className="text-gray-500 text-sm font-semibold mb-2">Shipping Orders</h2>
//           <p className="text-3xl font-bold text-indigo-700">{dashboardData.shippingOrders}</p>
//         </div>
        
//         <div className="bg-white rounded-lg shadow p-6 border-l-4 border-teal-500">
//           <h2 className="text-gray-500 text-sm font-semibold mb-2">Delivered Orders</h2>
//           <p className="text-3xl font-bold text-teal-700">{dashboardData.deliveredOrders}</p>
//         </div>
        
//         <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
//           <h2 className="text-gray-500 text-sm font-semibold mb-2">Total Revenue</h2>
//           <p className="text-3xl font-bold text-red-700">₹{dashboardData.revenue.toLocaleString()}</p>
//           <div className="mt-2">
//             <select 
//               className="text-sm border rounded p-1"
//               value={revenueFilter}
//               onChange={(e) => setRevenueFilter(e.target.value)}
//             >
//               <option value="month">This Month</option>
//               <option value="year">This Year</option>
//             </select>
//           </div>
//         </div>
//       </div>
      
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
//         {/* Top Products by Likes */}
//         <div className="bg-white rounded-lg shadow p-6">
//           <h2 className="text-xl font-semibold text-green-800 mb-4">Top 5 Liked Products</h2>
//           <div className="space-y-4">
//             {topProducts.map((product, index) => (
//               <div key={product.id} className="flex items-center justify-between p-3 bg-green-50 rounded">
//                 <div className="flex items-center">
//                   <span className="text-white bg-green-600 rounded-full h-8 w-8 flex items-center justify-center mr-3">
//                     {index + 1}
//                   </span>
//                   <span className="font-medium">{product.name}</span>
//                 </div>
//                 <span className="bg-green-100 text-green-800 py-1 px-3 rounded-full text-sm font-semibold">
//                   {product.likes} likes
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
        
//         {/* Visitor/Customer Graph */}
//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-xl font-semibold text-green-800">Traffic Analytics</h2>
//             <select 
//               className="border rounded p-2 text-sm"
//               value={selectedMetric}
//               onChange={(e) => setSelectedMetric(e.target.value)}
//             >
//               <option value="visitors">Visitors</option>
//               <option value="customers">Customers</option>
//             </select>
//           </div>
//           <div className="h-80">
//             {visitorData.labels && <Line data={filteredVisitorData} options={lineOptions} />}
//           </div>
//         </div>
//       </div>
      
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
//         {/* Sales Performance Graph */}
//         <div className="bg-white rounded-lg shadow p-6">
//           <h2 className="text-xl font-semibold text-green-800 mb-4">Sales Performance</h2>
//           <div className="h-96">
//             {salesData.labels && <Bar data={salesData} options={barOptions} />}
//           </div>
//         </div>

//         {/* Orders by Location */}
//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-xl font-semibold text-green-800">Orders by Location</h2>
//             <select
//               className="border rounded p-2 text-sm"
//               value={locationFilter}
//               onChange={(e) => setLocationFilter(e.target.value)}
//             >
//               <option value="state">State</option>
//               <option value="district">District</option>
//             </select>
//           </div>

//           {/* Chart */}
//           <div className="h-64 mb-6">
//             <Pie data={locationData} />
//           </div>

//           {/* List */}
//           <div className="space-y-3">
//             {(locationFilter === "state" ? stateOrders : districtOrders).map((loc, idx) => (
//               <div key={idx} className="flex justify-between bg-green-50 p-3 rounded">
//                 <span className="font-medium">{loc.name}</span>
//                 <span className="text-green-800 font-semibold">{loc.orders} Orders</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AdminDashboard() {
  // State for dashboard data
  const [dashboardData, setDashboardData] = useState({
    totalCustomers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  });

  // State for customer breakdown
  const [customerBreakdown, setCustomerBreakdown] = useState({
    total: 0,
    orderingCustomers: 0,
    prospectiveCustomers: 0
  });

  // State for stock statuses
  const [stockStatuses, setStockStatuses] = useState([]);

  // State for orders by status
  const [ordersByStatus, setOrdersByStatus] = useState([]);

  // State for charts
  const [topProducts, setTopProducts] = useState([]);
  const [salesData, setSalesData] = useState({});
  const [customerData, setCustomerData] = useState({
    labels: [],
    datasets: [],
    totalRegistered: 0,
    todayRegistered: 0
  });
  const [locations, setLocations] = useState({ states: [], cities: [] });
  const [locationType, setLocationType] = useState('state');
  const [revenueFilter, setRevenueFilter] = useState('month');

  // Initialize dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/admin/dashboard");
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }
        const data = await response.json();
        setCustomerBreakdown(data.customerBreakdown);
        setDashboardData({
          totalCustomers: data.customerBreakdown.total,
          totalProducts: data.totalProducts,
          totalOrders: data.totalOrders,
          totalRevenue: data.totalRevenue
        });
        setStockStatuses(data.stockStatuses);
        setOrdersByStatus(data.ordersByStatus);
        setTopProducts(data.topWishedProducts);
        const formattedLabels = data.customerSignups.labels.map(label => {
          const date = new Date(label);
          const day = String(date.getDate()).padStart(2, '0');
          const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
          const month = monthNames[date.getMonth()];
          const year = date.getFullYear();
          return `${day}-${month}-${year}`;
        });
        setCustomerData({
          labels: formattedLabels,
          datasets: [
            {
              label: 'New Customers',
              data: data.customerSignups.data,
              borderColor: 'rgb(53, 162, 235)',
              backgroundColor: 'rgba(53, 162, 235, 0.5)',
              tension: 0.1
            }
          ],
          totalRegistered: data.customerSignups.totalRegistered,
          todayRegistered: data.customerSignups.todayRegistered
        });
        setLocations(data.locations || { states: [], cities: [] });

        // Set sales data
        const salesProducts = data.salesPerformance?.products || [];
        const sortedByRevenue = [...salesProducts].sort((a, b) => (b.revenue || 0) - (a.revenue || 0));
        setSalesData({
          labels: sortedByRevenue.slice(0, 10).map(product => product.name),
          datasets: [
            {
              label: 'Units Sold',
              data: sortedByRevenue.slice(0, 10).map(product => product.units_sold || 0),
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1
            },
            {
              label: 'Revenue (₹)',
              data: sortedByRevenue.slice(0, 10).map(product => product.revenue || 0),
              backgroundColor: 'rgba(153, 102, 255, 0.6)',
              borderColor: 'rgba(153, 102, 255, 1)',
              borderWidth: 1
            }
          ]
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };

    fetchDashboardData();
  }, []);

 // Orders by Location chart data
const currentLocations = locationType === 'state' ? locations.states : locations.cities;
const locationKey = locationType === 'state' ? 'state' : 'city';
const locationData = {
  labels: currentLocations.map(loc => loc[locationKey]),
  datasets: [
    {
      data: currentLocations.map(loc => loc.count),
      backgroundColor: [
        'rgba(75,192,192,0.6)',
        'rgba(153,102,255,0.6)',
        'rgba(255,159,64,0.6)',
        'rgba(255,99,132,0.6)',
        'rgba(54,162,235,0.6)',
        'rgba(255,205,86,0.6)',
        'rgba(201,203,207,0.6)',
        'rgba(255,159,64,0.6)',
        'rgba(99,255,132,0.6)',
        'rgba(255,99,132,0.6)'
      ],
      borderColor: [
        'rgba(75,192,192,1)',
        'rgba(153,102,255,1)',
        'rgba(255,159,64,1)',
        'rgba(255,99,132,1)',
        'rgba(54,162,235,1)',
        'rgba(255,205,86,1)',
        'rgba(201,203,207,1)',
        'rgba(255,159,64,1)',
        'rgba(99,255,132,1)',
        'rgba(255,99,132,1)'
      ],
      borderWidth: 1,
    }
  ]
};
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top',
        labels: {
          font: {
            size: 12
          }
        }
      },
      title: { 
        display: true, 
        text: 'Sales Performance',
        font: {
          size: 16
        }
      },
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: 10
          }
        }
      },
      y: {
        ticks: {
          font: {
            size: 10
          }
        }
      }
    }
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top',
        labels: {
          font: {
            size: 12
          }
        }
      },
      title: { 
        display: true, 
        text: 'New Customers Over Time',
        font: {
          size: 16
        }
      },
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: 10
          }
        }
      },
      y: {
        ticks: {
          font: {
            size: 10
          }
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            size: 11
          }
        }
      }
    }
  };

  const activeStatuses = ordersByStatus.filter(item => item.count > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-2 sm:p-4 lg:p-6 xl:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-800 mb-4 sm:mb-6 lg:mb-8 text-center">Admin Dashboard</h1>
        
        {/* First Block: Customers Breakdown and Products with Stock Status */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 lg:p-6 mb-6 sm:mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Customers Breakdown */}
            <div className="transform hover:scale-105 transition-transform duration-200 p-3 sm:p-4">
              <h2 className="text-gray-600 text-xs sm:text-sm lg:text-base font-semibold mb-3 sm:mb-4 flex items-center justify-center lg:justify-start">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                Customer Overview
              </h2>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-700 mb-4 sm:mb-6 text-center lg:text-left">{customerBreakdown.total.toLocaleString()}</p>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center p-2 sm:p-3 bg-blue-50 rounded-lg">
                  <span className="text-xs sm:text-sm font-medium text-blue-800">Ordering Customers</span>
                  <span className="text-blue-600 font-bold text-base sm:text-lg">{customerBreakdown.orderingCustomers}</span>
                </div>
                <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <span className="text-xs sm:text-sm font-medium text-gray-800">Prospective Customers</span>
                  <span className="text-gray-600 font-bold text-base sm:text-lg">{customerBreakdown.prospectiveCustomers}</span>
                </div>
              </div>
            </div>
            
            {/* Products with Stock Status */}
            <div className="transform hover:scale-105 transition-transform duration-200 p-3 sm:p-4">
              <h2 className="text-gray-600 text-xs sm:text-sm lg:text-base font-semibold mb-3 sm:mb-4 flex items-center justify-center lg:justify-end">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Product Overview
              </h2>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-700 mb-4 sm:mb-6 text-center lg:text-right">{dashboardData.totalProducts}</p>
              <div className="space-y-2 sm:space-y-3">
                {stockStatuses.map((status) => (
                  <div key={status.status} className="flex justify-between items-center p-2 sm:p-3 bg-purple-50 rounded-lg">
                    <span className="text-xs sm:text-sm font-medium text-purple-800 capitalize">{status.status}</span>
                    <span className={`font-bold text-base sm:text-lg ${status.status === 'In Stock' ? 'text-green-600' : 'text-red-600'}`}>
                      {status.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Second Block: Total Orders (Centered) with Breakdown Below */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 lg:p-6 mb-6 sm:mb-8 text-center">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-gray-600 text-xs sm:text-sm lg:text-base font-semibold mb-2 sm:mb-3 flex items-center justify-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Total Orders
            </h2>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-green-700">{dashboardData.totalOrders.toLocaleString()}</p>
          </div>
          
          {activeStatuses.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Order Status Breakdown</h3>
              <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
                {activeStatuses.map((status) => (
                  <div key={status.status} className="bg-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-2 text-xs sm:text-sm">
                    <span className="text-gray-700 font-medium capitalize">{status.status}</span>
                    <span className="text-green-600 font-bold">{status.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Third Block: Total Revenue (Full Width) */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 lg:p-6 mb-6 sm:mb-8 text-center transform hover:scale-105 transition-transform duration-200">
          <h2 className="text-gray-600 text-xs sm:text-sm lg:text-base font-semibold mb-2 sm:mb-3 flex items-center justify-center">
            ₹ Total Delivered Revenue
          </h2>
          <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-red-700">₹{dashboardData.totalRevenue.toLocaleString()}</p>
          <div className="mt-3 sm:mt-4">
            <select 
              className="text-xs sm:text-sm border border-gray-300 rounded-lg p-1 sm:p-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              value={revenueFilter}
              onChange={(e) => setRevenueFilter(e.target.value)}
            >
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Top Products by Wishes */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 lg:p-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-green-800 mb-4 sm:mb-6 flex items-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-pink-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Top 5 Wished Products
            </h2>
            <div className="space-y-3 sm:space-y-4 max-h-80 overflow-y-auto">
              {topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center space-x-3 sm:space-x-4 p-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border border-pink-200">
                  <img
                    src={`http://localhost:5000${product.thumbnail_url}`}
                    alt={product.name}
                    className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg flex-shrink-0"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/48?text=?";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{product.name}</p>
                    <p className="text-xs sm:text-sm text-gray-600">{product.description ? product.description.substring(0, 50) + '...' : ''}</p>
                  </div>
                  <span className="bg-pink-100 text-pink-800 py-1 px-2 sm:px-3 rounded-full text-xs sm:text-sm font-semibold">
                    {product.wish_count} wishes
                  </span>
                  <span className="text-white bg-pink-600 rounded-full h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center font-bold text-xs sm:text-sm">
                    {index + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Customer Analytics Graph */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 lg:p-6 relative">
            <h2 className="text-xl sm:text-2xl font-semibold text-green-800 mb-4 sm:mb-6">Customer Analytics</h2>
            <div className="absolute top-4 sm:top-6 right-4 sm:right-6 text-xs sm:text-sm text-gray-700 hidden lg:block">
              <p>Total Registered Customers: <span className="font-bold">{customerData.totalRegistered}</span></p>
              <p>Today Registered Customers: <span className="font-bold">{customerData.todayRegistered}</span></p>
            </div>
            <div className="lg:absolute lg:top-24 lg:right-6 lg:w-48 lg:h-24 text-xs sm:text-sm text-gray-700">
              <p>Total Registered Customers: <span className="font-bold">{customerData.totalRegistered}</span></p>
              <p>Today Registered Customers: <span className="font-bold">{customerData.todayRegistered}</span></p>
            </div>
            <div className="h-48 sm:h-64 lg:h-80 w-full">
              {customerData.labels.length > 0 && <Line data={customerData} options={lineOptions} />}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Sales Performance Graph */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 lg:p-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-green-800 mb-4 sm:mb-6">Sales Performance</h2>
            <div className="h-64 sm:h-80 lg:h-96 w-full">
              {salesData.labels && salesData.labels.length > 0 && <Bar data={salesData} options={barOptions} />}
            </div>
          </div>

          {/* Orders by Location */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-green-800 mb-2 sm:mb-0">Orders by Location</h2>
              <select 
                className="text-xs sm:text-sm border border-gray-300 rounded-lg p-1 sm:p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ml-0 sm:ml-4 mt-2 sm:mt-0"
                value={locationType}
                onChange={(e) => setLocationType(e.target.value)}
              >
                <option value="state">By State</option>
                <option value="city">By City</option>
              </select>
            </div>
            <div className="h-48 sm:h-64 lg:h-80 w-full mb-4 sm:mb-6">
              {currentLocations.length > 0 && <Pie data={locationData} options={pieOptions} />}
            </div>
            <div className="space-y-2 sm:space-y-3 max-h-40 overflow-y-auto">
              {currentLocations.map((loc, idx) => (
                <div key={idx} className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-cyan-50 p-2 sm:p-3 rounded-lg text-xs sm:text-sm">
                  <span className="font-medium text-gray-800 truncate flex-1 mr-2">{loc[locationKey]}</span>
                  <span className="text-blue-800 font-semibold bg-blue-100 py-1 px-2 sm:px-3 rounded-full text-xs sm:text-sm whitespace-nowrap">{loc.count} Orders</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}