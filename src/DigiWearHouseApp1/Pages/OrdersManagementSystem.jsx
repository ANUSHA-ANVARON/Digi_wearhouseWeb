import React, { useState } from "react";
import {
  ChevronLeft,
  MapPin,
  CreditCard,
  Eye,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import orderImage from "../../assets/order.png";
import emptyOrderImg from "../../assets/receipt-item.png";
import { useNavigate } from "react-router-dom";

const OrdersManagementSystem = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();

  // Sample order data based on the screenshots
  const orders = [
    {
      id: 1,
      status: "delivered",
      date: "Apr 9, 2024, 9:07 AM",
      total: 840,
      paymentMethod: "Paid with cash",
      items: 6,
      itemsData: [
        {
          name: "Pink Ethnic lehanga",
          price: 140,
          quantity: 1,
          image: orderImage,
        },
        {
          name: "Pink Ethnic lehanga",
          price: 140,
          quantity: 1,
          image: orderImage,
        },
        {
          name: "Pink Ethnic lehanga",
          price: 140,
          quantity: 1,
          image: orderImage,
        },
        {
          name: "Pink Ethnic lehanga",
          price: 140,
          quantity: 1,
          image: orderImage,
        },
        {
          name: "Pink Ethnic lehanga",
          price: 140,
          quantity: 1,
          image: orderImage,
        },
        {
          name: "Pink Ethnic lehanga",
          price: 140,
          quantity: 1,
          image: orderImage,
        },
      ],
      deliveryAddress:
        "📍 Shop No-07, Top Floor, Rangpur Electronics Bazar-800001",
      timeline: [
        { status: "Order Placed", date: "Apr 9, 2024, 9:07 AM", active: false },
        {
          status: "Order Shipped",
          date: "Apr 9, 2024, 9:07 AM",
          active: false,
        },
        {
          status: "Order Delivered",
          date: "Apr 9, 2024, 9:07 AM",
          active: true,
        },
      ],
    },
    {
      id: 3,
      status: "pending",
      date: "Apr 7, 2024, 10:17 AM",
      total: 840,
      paymentMethod: "Paid with cash",
      items: 6,
      itemsData: [
        {
          name: "Pink Ethnic lehanga",
          price: 140,
          quantity: 1,
          image: orderImage,
        },
        {
          name: "Pink Ethnic lehanga",
          price: 140,
          quantity: 1,
          image: orderImage,
        },
        {
          name: "Pink Ethnic lehanga",
          price: 140,
          quantity: 1,
          image: orderImage,
        },
        {
          name: "Pink Ethnic lehanga",
          price: 140,
          quantity: 1,
          image: orderImage,
        },
        {
          name: "Pink Ethnic lehanga",
          price: 140,
          quantity: 1,
          image: orderImage,
        },
        {
          name: "Pink Ethnic lehanga",
          price: 140,
          quantity: 1,
          image: orderImage,
        },
      ],
      deliveryAddress:
        "📍 Shop No-07, Top Floor, Rangpur Electronics Bazar-800001",
      timeline: [
        { status: "Order Placed", date: "Apr 6, 2024, 9:07 AM", active: true },
        {
          status: "Order Shipped",
          date: "Apr 6, 2024, 9:07 AM",
          active: false,
        },
        {
          status: "Order Delivered",
          date: "Apr 6, 2024, 9:07 AM",
          active: false,
        },
      ],
    },
    {
      id: 4,
      status: "shipped",
      date: "Apr 6, 2024, 9:07 AM",
      total: 840,
      paymentMethod: "Paid with cash",
      items: 6,
      itemsData: [
        {
          name: "Pink Ethnic lehanga",
          price: 140,
          quantity: 1,
          image: orderImage,
        },
        {
          name: "Pink Ethnic lehanga",
          price: 140,
          quantity: 1,
          image: orderImage,
        },
        {
          name: "Pink Ethnic lehanga",
          price: 140,
          quantity: 1,
          image: orderImage,
        },
        {
          name: "Pink Ethnic lehanga",
          price: 140,
          quantity: 1,
          image: orderImage,
        },
      ],
      deliveryAddress:
        "📍 Shop No-07, Top Floor, Rangpur Electronics Bazar-800001",
      timeline: [
        { status: "Order Placed", date: "Apr 6, 2024, 9:07 AM", active: false },
        { status: "Order Shipped", date: "Apr 6, 2024, 9:07 AM", active: true },
        {
          status: "Order Delivered",
          date: "Apr 6, 2024, 9:07 AM",
          active: false,
        },
      ],
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "text-green-600 bg-green-50 border-green-200";
      case "shipped":
        return "text-red-700 bg-red-50 border-red-200";
      case "pending":
        return "text-amber-600 bg-amber-50 border-amber-200";
      case "cancelled":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="w-4 h-4" />;
      case "shipped":
        return <Truck className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  // Fixed filteredOrders - removed duplicate code
  const filteredOrders =
    activeTab === "All"
      ? orders
      : orders.filter((order) => {
          const statusMap = {
            Shipped: "shipped",
            Delivered: "delivered",
            Pending: "pending",
            Cancelled: "cancelled",
          };
          return order.status === statusMap[activeTab];
        });

  const tabs = ["All", "Shipped", "Delivered", "Pending", "Cancelled"];

  // Fixed getStatusText function to avoid duplicate ternary
  const getStatusText = (status) => {
    switch (status) {
      case "delivered":
        return "Delivered";
      case "shipped":
        return "Shipped";
      case "pending":
        return "Pending";
      case "cancelled":
        return "Cancelled";
      default:
        return "Placed";
    }
  };

  if (selectedOrder) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back
              </button>
              <button className="text-red-700 hover:text-red-800 font-medium">
                Help
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Status Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-center mb-6 ">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Order is {getStatusText(selectedOrder.status)}
                  </h2>
                </div>

                {/* Timeline */}
                {selectedOrder.timeline && (
                  <div className="flex items-center justify-between mb-8 px-4">
                    {selectedOrder.timeline.map((step, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            step.active ? "bg-red-700" : "bg-gray-300"
                          }`}
                        ></div>
                        <div className="text-xs text-gray-500 mt-1 text-center max-w-20">
                          {step.status}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {step.date}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Items List */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Items Name</h3>
                  {selectedOrder.itemsData.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-center">
                        <div>
                          <img
                            src={item.image}
                            alt="item_image"
                            className="w-18 h-14"
                          />
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-500">₹{item.price}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-900 font-medium">
                          {item.quantity}x
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    {selectedOrder.status === "cancelled"
                      ? "Your order has been cancelled."
                      : "You can cancel your order before it starts being prepared."}
                  </p>
                </div>

                {selectedOrder.status !== "cancelled" && selectedOrder.status !== "delivered" && (
                  <div className="mt-4">
                    <button className="w-full cursor-pointer sm:w-auto px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                      Cancel Order
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Order Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fees</span>
                    <span>₹0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service Fees</span>
                    <span>₹0</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>₹{selectedOrder.total}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Payed With
                  </h4>
                  <div className="flex items-center">
                    <CreditCard className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      {selectedOrder.paymentMethod}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Delivery Address
                  </h4>
                  <p className="text-sm text-gray-600">
                    {selectedOrder.deliveryAddress}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center mb-6">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-3"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 ">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                  activeTab === tab
                    ? "text-white border-transparent"
                    : "text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300"
                }`}
                style={
                  activeTab === tab
                    ? { background: "#4F8396" }
                    : {}
                }
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                  <div
                    className="flex items-center space-x-2 cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    {getStatusIcon(order.status)}
                    <span className="text-red-700 font-medium">
                      Order {getStatusText(order.status)}
                    </span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 text-sm text-gray-600">
                  <span>{order.date}</span>
                  <div className="flex items-center space-x-1">
                    <CreditCard className="w-4 h-4" />
                    <span>₹{order.total}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>{order.paymentMethod}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Package className="w-4 h-4" />
                    <span>{order.items} Items</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                {/* Product Images */}
                <div className="flex flex-wrap space-x-2 mb-4 sm:mb-0">
                  {order.itemsData.slice(0, 6).map((item, index) => (
                    <div key={index} className="mr-2">
                      <img src={item.image} alt="" className="w-20 h-14" />
                    </div>
                  ))}
                  {order.itemsData.length > 6 && (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-600 flex-shrink-0">
                      +{order.itemsData.length - 6}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setSelectedOrder(order)}
                  className="flex items-center space-x-2 px-4 py-2 text-red-700 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span className="font-medium">
                    View {getStatusText(order.status)} Details
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
        {/* Empty State for filtered tab */}
        {filteredOrders.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <img
              src={emptyOrderImg}
              alt="No orders"
              className="w-16 h-16 mx-auto mb-4"
            />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              You Don’t Have any added address
            </h3>
            <p className="text-gray-600">You Don’t Have any added address</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersManagementSystem;