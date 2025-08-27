# Gabay Laguna Backend API

A comprehensive Laravel backend for the Gabay Laguna tour guide booking platform, built following the Waterfall SDLC and evaluated based on ISO/IEC 25010:2023 standards.

## 🏗️ Architecture Overview

This backend is designed to support a tour guide booking platform with the following key features:

- **Multi-user Authentication System** (Tourists, Tour Guides, Admins)
- **Tour Guide Booking Management**
- **Real-time Availability Tracking**
- **Secure Payment Processing** (PayPal & PayMongo)
- **Feedback and Rating System**
- **Location-based Services** (Google Maps API ready)
- **Admin Dashboard for Verification and Monitoring**

## 🚀 Features

### Authentication & Authorization
- Laravel Sanctum for API authentication
- Role-based middleware (Admin, Guide, Tourist)
- User verification system
- Secure password management

### Tour Guide Management
- Guide registration and verification
- Specialization management
- Availability scheduling
- Real-time status tracking

### Booking System
- Advanced booking with conflict detection
- Real-time availability checking
- Booking status management
- Special request handling

### Payment Integration
- PayPal integration
- PayMongo integration
- Webhook handling
- Payment status tracking

### Review & Rating System
- Post-booking reviews
- Rating validation
- Review moderation

### Admin Dashboard
- User management
- Guide verification
- Booking monitoring
- Payment tracking
- Analytics and reporting

## 🛠️ Technology Stack

- **Framework**: Laravel 12.x
- **Database**: MySQL/PostgreSQL (with SQLite for development)
- **Authentication**: Laravel Sanctum
- **API**: RESTful API with JSON responses
- **Validation**: Laravel Form Request Validation
- **Testing**: PHPUnit

## 📋 Prerequisites

- PHP 8.2+
- Composer
- MySQL/PostgreSQL or SQLite
- Node.js & NPM (for frontend assets)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gabay-laguna-backend
   ```

2. **Install dependencies**
   ```bash
   composer install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. **Database configuration**
   ```bash
   # Update .env file with database credentials
   php artisan migrate
   php artisan db:seed
   ```

5. **Install Sanctum**
   ```bash
   php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
   php artisan migrate
   ```

6. **Start the server**
   ```bash
   php artisan serve
   ```

## 🗄️ Database Schema

### Core Tables
- `users` - User accounts with role-based access
- `cities` - City information with coordinates
- `categories` - Tour categories (food, historical, natural, etc.)
- `points_of_interest` - Tourist attractions with location data
- `tour_guides` - Guide profiles and credentials
- `guide_availabilities` - Guide scheduling
- `guide_specializations` - Guide expertise areas
- `bookings` - Tour reservations
- `payments` - Payment transactions
- `reviews` - User feedback and ratings

## 🔐 API Endpoints

### Public Routes
- `POST /api/register` - Tourist registration
- `POST /api/guide/register` - Guide registration
- `POST /api/login` - User authentication
- `GET /api/cities` - List cities
- `GET /api/categories` - List categories
- `GET /api/pois` - List points of interest
- `GET /api/guides` - List tour guides

### Protected Routes
- `GET /api/user` - User profile
- `PUT /api/user/profile` - Update profile
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - User bookings
- `POST /api/reviews` - Submit review

### Admin Routes
- `GET /api/admin/dashboard` - Admin statistics
- `GET /api/admin/users` - User management
- `PUT /api/admin/users/{id}/verify` - Verify user
- `GET /api/admin/analytics` - System analytics

## 🔒 Security Features

- **Input Validation**: Comprehensive request validation
- **SQL Injection Protection**: Eloquent ORM with prepared statements
- **XSS Protection**: Output sanitization
- **CSRF Protection**: Built-in Laravel protection
- **Rate Limiting**: API rate limiting
- **Authentication**: Secure token-based authentication

## 📊 ISO/IEC 25010:2023 Compliance

### Functional Suitability
- Complete user management system
- Comprehensive booking workflow
- Payment processing integration
- Review and rating system

### Reliability
- Error handling and logging
- Database transaction management
- Input validation and sanitization
- Graceful failure handling

### Security
- Role-based access control
- Secure authentication
- Input validation
- SQL injection protection

### Maintainability
- Clean code architecture
- Comprehensive documentation
- Modular design
- Standard Laravel conventions

## 🧪 Testing

```bash
# Run tests
php artisan test

# Run specific test suite
php artisan test --filter=AuthTest
```

## 📝 API Documentation

### Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer {token}
```

### Response Format
```json
{
    "message": "Success message",
    "data": {},
    "errors": {}
}
```

### Error Handling
- `400` - Bad Request (Validation errors)
- `401` - Unauthorized (Invalid token)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## 🔧 Configuration

### Environment Variables
```env
APP_NAME="Gabay Laguna"
APP_ENV=production
APP_DEBUG=false
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gabay_laguna
DB_USERNAME=root
DB_PASSWORD=

PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_SECRET=your_paypal_secret
PAYMONGO_SECRET_KEY=your_paymongo_secret_key
```

## 🚀 Deployment

1. **Production setup**
   ```bash
   composer install --optimize-autoloader --no-dev
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

2. **Database migration**
   ```bash
   php artisan migrate --force
   ```

3. **Queue workers** (if using queues)
   ```bash
   php artisan queue:work
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Built with ❤️ using Laravel and following industry best practices**

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

You may also try the [Laravel Bootcamp](https://bootcamp.laravel.com), where you will be guided through building a modern Laravel application from scratch.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com)**
- **[Tighten Co.](https://tighten.co)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Redberry](https://redberry.international/laravel-development)**
- **[Active Logic](https://activelogic.com)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
