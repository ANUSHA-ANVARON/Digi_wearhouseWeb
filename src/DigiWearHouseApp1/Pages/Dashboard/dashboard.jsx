import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/Context';
import firebaseService from '../../../SERVICES/firebaseService';

import dash_cover from '../../../assets/dash_cover.png';
import dash_icon1 from '../../../assets/dash_icon1.png';
import dash_icon2 from '../../../assets/dash_icon2.png';
import dash_icon3 from '../../../assets/dash_icon3.png';
import dash_icon4 from '../../../assets/dash_icon4.png';

const VendorDashboard = () => {
  const { currentUser, userData } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState('Monthly');
  const [dashboardData, setDashboardData] = useState({
    totalProducts: 0,
    totalInventory: 0,
    totalRevenue: 0,
    totalUnitsSold: 0,
    products: [],
    loading: true,
    error: null
  });

  const periods = ['Daily', 'Weekly', 'Monthly'];

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser) {
        setDashboardData(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'Please log in to view dashboard' 
        }));
        return;
      }

      try {
        console.log(userData, "userdata")
        console.log(currentUser,"currentUser")
        console.log('Fetching dashboard data for user:', currentUser.uid);
        
        // Fetch user's products
        const products = await firebaseService.getUserProducts(currentUser.uid);
        
        // Calculate dashboard metrics
        const totalProducts = products.length;
        
        // Calculate total inventory (sum of all units across all products)
        const totalInventory = products.reduce((total, product) => {
          const productUnits = Object.values(product.units || {}).reduce((sum, units) => (parseInt(units) || 0), 0);
          return total + productUnits;
        }, 0);
        
        // Calculate total revenue potential (price * inventory)
        const totalRevenue = products.reduce((total, product) => {
          const productUnits = Object.values(product.units || {}).reduce((sum, units) => sum + (parseInt(units) || 0), 0);
          const price = parseFloat(product.price) || 0;
          return total + (price * productUnits);
        }, 0);
        
        // For now, total units sold is 0 (you'll need order data for this)
        const totalUnitsSold = 0;
        
        setDashboardData({
          totalProducts,
          totalInventory,
          totalRevenue,
          totalUnitsSold,
          products,
          loading: false,
          error: null
        });
        
        console.log('Dashboard data calculated:', {
          totalProducts,
          totalInventory,
          totalRevenue,
          totalUnitsSold
        });
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setDashboardData(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to fetch dashboard data'
        }));
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  // Calculate chart data based on products (placeholder for now)
  const chartData = [
    { month: 'May', value: 0, color: 'bg-gray-200' },
    { month: 'Jun', value: 0, color: 'bg-blue-400' },
    { month: 'Jul', value: 0, color: 'bg-gray-200' },
    { month: 'Aug', value: 0, color: 'bg-gray-200' },
    { month: 'Sep', value: 0, color: 'bg-gray-200' },
    { month: 'Oct', value: 0, color: 'bg-gray-200' },
    { month: 'Nov', value: 0, color: 'bg-gray-200' },
    { month: 'Dec', value: dashboardData.totalRevenue, color: 'bg-slate-600', height: 'h-20' },
    { month: 'Jan', value: 0, color: 'bg-gray-200' }
  ];

  // Loading state
  if (dashboardData.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (dashboardData.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-sm">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Dashboard Error</h2>
          <p className="text-gray-600 mb-4">{dashboardData.error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="px-4 md:px-6 lg:px-8 py-6 md:py-8">
        {/* Welcome Section */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 md:mb-6">
            Welcome, {currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Vendor'}!
          </h1>
          
          {/* Hero Image */}
          <div className="relative rounded-lg overflow-hidden bg-gray-800 h-40 md:h-48 lg:h-56 xl:h-64">
            <img 
              src={dash_cover}  
              alt="Warehouse with digital displays"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/50 to-gray-800/30"></div>
            
            
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Products Card */}
          <Link to={"/products"}>
            <div className="bg-white rounded-lg border-2 border-gray-200 p-4 md:p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg md:text-xl font-semibold text-gray-700">Products</h3>
                <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-500 rounded-full flex items-center justify-center">
                  <img src={dash_icon1} className='p-3' alt="" />
                </div>
              </div>
              <div className="text-4xl text-start md:text-5xl font-bold text-gray-800">
                {dashboardData.totalProducts}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Total units 
              </div>
              {/* {dashboardData.products.length > 0 && (
                <div className="text-xs text-gray-500 mt-2">
                  Latest: {dashboardData.products[0].title?.substring(0, 20)}...
                </div>
              )} */}
            </div>
          </Link>

          {/* Inventory Card */}
          <Link to={"/inventory"}>
            <div className="bg-white rounded-lg border-2 border-gray-200 p-4 md:p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg md:text-xl font-semibold text-gray-700">Inventory</h3>
                <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-500 rounded-full flex items-center justify-center">
                  <img src={dash_icon2} className='p-3' alt="" />
                </div>
              </div>
              <div className="text-4xl text-start md:text-5xl font-bold text-gray-800">
                 
                {/* {dashboardData.totalInventory} */}
                {dashboardData.totalProducts}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Total units across all products
              </div>
            </div>
          </Link>

          {/* Total Revenue Card */}
          <Link to={"/total-revenue"}>
            <div className="bg-white rounded-lg border-2 border-gray-200 p-4 md:p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg md:text-xl font-semibold text-gray-700">Total Revenue</h3>
                <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-500 rounded-full flex items-center justify-center">
                  <img className='p-3' src={dash_icon3} alt="" />
                </div>
              </div>
              <div className="text-4xl text-start md:text-5xl font-bold text-gray-800">
              {dashboardData.totalRevenue ? 0 : 0 } 
                {/* {dashboardData.totalRevenue.toFixed(0)} */}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Potential revenue from inventory
              </div>
            </div>
          </Link>

          {/* Total Units Sold Card */}
          <Link to={"/total-units"}>
            <div className="bg-white rounded-lg border-2 border-gray-200 p-4 md:p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg md:text-xl font-semibold text-gray-700">Total Units sold</h3>
                <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-500 rounded-full flex items-center justify-center">
                  <img src={dash_icon4} className='p-3' alt="" />
                </div>
              </div>
              <div className="text-4xl text-start md:text-5xl font-bold text-gray-800">
                {dashboardData.totalUnitsSold}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Coming soon - order tracking
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Products Section */}
        {dashboardData.products.length > 0 && (
          <div className="bg-white rounded-lg p-4 md:p-6 mb-6 md:mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Recent Products</h2>
              <Link 
                to="/products" 
                className="text-blue-500 hover:text-blue-600 text-sm font-medium"
              >
                View All →
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.products.slice(0, 3).map((product) => (
                <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start space-x-3">
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {product.imageUrls && product.imageUrls.length > 0 ? (
                        <img
                          src={product.imageUrls[0]}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-gray-400 text-2xl">👗</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {product.title || 'Untitled Product'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {product.category || 'No Category'}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-lg font-bold text-gray-900">
                          ₹{product.price || '0'}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          product.isPublished 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {product.isPublished ? 'Live' : 'Draft'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Section */}
        <div className="bg-white rounded-lg p-4 md:p-6 lg:p-8">
          <div className="mb-6">
            <h2 className="text-xl md:text-2xl text-start font-bold text-gray-900 mb-1">Performance</h2>
            <p className="text-gray-600 text-start text-sm md:text-base mb-2">Sales Statistics</p>
            <p className="text-gray-500 text-start text-xs md:text-sm">
              Updated: {new Date().toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })}
            </p>
          </div>

          {/* Period Selector */}
          <div className="mb-6 md:mb-8 flex   justify-center   ">
            <div className="flex bg-gray-100 w-auto   rounded-lg ">
              {periods.map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`flex-1  px-4 py-2 text-sm md:text-base lg:w-72 sm:w-56  w-auto  font-medium rounded-md transition-colors ${
                    selectedPeriod === period
                      ? 'bg-[#7DBBD1] text-white'
                      : 'text-gray-600 hover:text-gray-800' 
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* High/Low Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 space-y-2 md:space-y-0">
            <div>
              <span className="text-sm text-gray-900 md:text-base">High:</span>
              <span className="font-semibold text-gray-600 ml-1">
                DEC - ₹{Math.max(...chartData.map(d => d.value))}
              </span>
            </div>
            <div>
              <span className="text-gray-900 text-sm md:text-base">Low:</span>
              <span className="font-semibold text-gray-600 ml-1">
                JUN - ₹0
              </span>
            </div>
          </div>

          {/* Chart */}
          <div className="relative">
            <div className="flex items-end justify-between space-x-2 md:space-x-4 h-40 md:h-48 lg:h-56">
              {chartData.map((item, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="relative w-full flex justify-center mb-2">
                    <span className="text-xs md:text-sm text-gray-600">
                      {item.value > 0 ? `₹${item.value.toFixed(0)}` : '0'}
                    </span>
                  </div>
                  <div 
                    className={`w-full max-w-8 md:max-w-12 rounded-t ${item.color} ${
                      item.height || (item.value > 0 ? 'h-12 md:h-16' : 'h-2 md:h-4')
                    } transition-all duration-300`}
                  ></div>
                  <div className="mt-2 md:mt-3">
                    <span className="text-xs md:text-sm text-gray-600 font-medium">{item.month}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        {dashboardData.totalProducts === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Get Started</h3>
            <p className="text-blue-700 mb-4">
              You haven't added any products yet. Start building your catalog!
            </p>
            <Link 
              to="/upload-products" 
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-block"
            >
              Add Your First Product
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default VendorDashboard;