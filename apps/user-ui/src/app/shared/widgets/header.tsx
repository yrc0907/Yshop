import React from 'react';
import { IoSearchOutline } from 'react-icons/io5';
import { FaRegHeart, FaRegUserCircle } from 'react-icons/fa';
import { BsCart3 } from 'react-icons/bs';

const Header = () => {
  return (
    <header className="w-full h-20 bg-white sticky top-0 left-0 z-50 border-b-[1px] border-b-gray-300">
      <nav className="h-full px-4 max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div>
          <a href={'/'}>
            <h1 className="text-2xl font-bold text-slate-800 font-poppins cursor-pointer">
              Eshop
            </h1>
          </a>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-lg mx-4 hidden md:block">
          <input
            type="text"
            placeholder="Search for products..."
            className="w-full pl-4 pr-12 py-2 text-base text-gray-700 bg-gray-100 border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <IoSearchOutline
            size={22}
            className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-400"
          />
        </div>

        {/* User Area */}
        <div className="flex items-center gap-x-6">
          <button className="flex items-center gap-x-2" aria-label="User account">
            <FaRegUserCircle size={24} className="text-gray-700" />
          </button>
          <button className="relative" aria-label="Wishlist">
            <FaRegHeart size={24} className="text-gray-700" />
            <span className="absolute -top-2 -right-3 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-semibold">
              0
            </span>
          </button>
          <button className="relative" aria-label="Shopping cart">
            <BsCart3 size={24} className="text-gray-700" />
            <span className="absolute -top-2 -right-3 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-semibold">
              0
            </span>
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;