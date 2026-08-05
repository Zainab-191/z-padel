# Z Padel — منصة حجز ملاعب البادل

منصة إلكترونية لحجز ملاعب البادل: واجهة عميل بدون تسجيل حساب، ولوحة تحكم إدارية كاملة، خلف API واحد بمعمارية Clean Architecture.

## هيكل المشروع

```
Z Padel/
  backend/                 # .NET 8 Web API — Clean Architecture
    src/
      ZPadel.Domain/        # الكيانات والـ Enums، بدون أي اعتمادية خارجية
      ZPadel.Application/   # DTOs، Validators، منطق الأعمال (الحجز، التسعير، التوفر)
      ZPadel.Infrastructure/# EF Core + SQL Server، JWT، Thawani client، الـ Migrations
      ZPadel.Api/            # Controllers، Middleware، DI، Swagger
  customer-web/             # React 18 + Vite — واجهة العميل (Guest booking)
  admin-dashboard/          # React 18 + Vite — لوحة التحكم الإدارية
```

## التقنيات المستخدمة

- **Backend:** .NET 8 Web API، Clean Architecture (Domain / Application / Infrastructure / API)، Entity Framework Core (Code-First) على SQL Server، FluentValidation، JWT Authentication، Serilog، ASP.NET Core Rate Limiting، Swagger/OpenAPI.
- **Frontend:** React 18 + Vite + React Router + Axios + Tailwind CSS v4 (تطبيقان منفصلان تماماً لضمان عدم تسرب أي بيانات إدارية لتطبيق العميل).
- **قاعدة البيانات:** SQL Server (يعمل هنا على `SQLEXPRESS` محلياً)، عبر EF Core Migrations.
- **الدفع:** الدفع عند الوصول، والدفع الإلكتروني عبر بوابة **ثواني (Thawani)** — بيئة Sandbox.

## متطلبات التشغيل

- .NET 8 SDK
- Node.js 18+ و npm
- SQL Server (Express أو أي إصدار محلي) — أو عدّل `ConnectionStrings:DefaultConnection` للإشارة لخادمك

## خطوات التشغيل

### 1) الـ Backend

```bash
cd backend
dotnet restore
dotnet run --project src/ZPadel.Api/ZPadel.Api.csproj
```

- يفتح على `http://localhost:5100` و Swagger على `http://localhost:5100/swagger`.
- عند أول تشغيل، يقوم النظام تلقائياً بـ:
  - تطبيق الـ Migrations وإنشاء قاعدة البيانات `ZPadelDb`.
  - زرع مستخدم إداري افتراضي.
  - زرع 3 ملاعب تجريبية بساعات عمل وأسعار متدرجة جاهزة، لتسهيل التجربة فوراً بدون إعداد يدوي.
- سلسلة الاتصال الافتراضية في `appsettings.json`: `Server=.\SQLEXPRESS;Database=ZPadelDb;Trusted_Connection=True;TrustServerCertificate=True;` — عدّلها إذا كان اسم السيرفر لديك مختلفاً.
- ملف `Properties/launchSettings.json` موجود منذ البداية ويضبط `ASPNETCORE_ENVIRONMENT=Development` تلقائياً عند `dotnet run` — بدونه سيفترض .NET بيئة Production ويرفض مفتاح JWT الافتراضي.

### 2) واجهة العميل (customer-web)

```bash
cd customer-web
npm install
npm run dev
```

يفتح على `http://localhost:5173`. متغير `VITE_API_BASE_URL` في ملف `.env` يشير افتراضياً إلى `http://localhost:5100/api`.

### 3) لوحة التحكم (admin-dashboard)

```bash
cd admin-dashboard
npm install
npm run dev
```

يفتح على `http://localhost:5174`، بنفس آلية `VITE_API_BASE_URL`.

## بيانات الدخول الافتراضية للوحة التحكم

```
اسم المستخدم: admin
كلمة المرور:  ZPadel@Admin123
```

(يُنصح بتغييرها قبل أي استخدام حقيقي — لا يوجد حالياً واجهة لتغيير كلمة المرور).

## إعداد الدفع الإلكتروني عبر ثواني (اختياري)

مسار الدفع عند الوصول يعمل بالكامل بدون أي إعداد إضافي. لتجربة الدفع الإلكتروني الفعلي عبر ثواني:

1. أنشئ حساب Sandbox من [بوابة ثواني](https://thawani-technologies.stoplight.io/docs/thawani-ecommerce-api) واحصل على `Publishable Key` و `Secret Key`.
2. ضعهما في `backend/src/ZPadel.Api/appsettings.Development.json` (أو عبر `dotnet user-secrets`) تحت `Thawani:PublishableKey` و `Thawani:SecretKey`.
3. بما أن Webhook ثواني الحقيقي يحتاج رابط عام (public callback URL) غير متوفر في بيئة تشغيل محلية، أضفنا مساراً بديلاً: صفحة "نجاح الدفع" في واجهة العميل تستدعي `POST /api/bookings/{reference}/confirm-thawani-payment`، والذي يقوم **بنفس آلية التحقق** المستخدمة في الـ Webhook — إعادة الاستعلام عن حالة الدفع والمبلغ الفعلي من ثواني مباشرة، وليس الثقة بمجرد نجاح إعادة التوجيه. هذا يسمح باختبار المسار كاملاً محلياً، مع بقاء `POST /api/payments/thawani/webhook` جاهزاً لبيئة إنتاج حقيقية.

## قرارات تصميم مهمة

- **إخفاء هوية الملعب عن العميل بالكامل:** الـ DTOs المرسلة لواجهة العميل (`AvailableHourDto`, `BookingSlotSummaryDto`, `BookingResultDto`...) لا تحتوي أي معرّف أو اسم ملعب إطلاقاً — هذا مطبّق على مستوى تصميم الـ API نفسه وليس إخفاءً في الواجهة فقط. لوحة التحكم فقط ترى اسم الملعب (`AdminBookingSlotRowDto`).
- **التوفر المجمّع:** يظهر الوقت متاحاً للعميل طالما هناك ملعب واحد نشط بلا حجز لذلك الوقت. يُخصَّص الملعب عشوائياً فقط لحظة تأكيد الحجز (`POST /api/bookings`)، ضمن معاملة قاعدة بيانات واحدة، مع إعادة محاولة تلقائية عند تعارض السباق (race condition) واسترجاع دقيق لأي وقت لم يعد متاحاً.
- **منع الحجز المزدوج فعلياً من قاعدة البيانات:** فهرس فريد (Unique Index) مُصفّى (Filtered) على `BookingSlots(CourtId, Date, StartTime) WHERE ReleasedAt IS NULL` — وليس مجرد منطق تطبيقي. عند الإلغاء أو انتهاء المهلة أو فشل الدفع، يتم "تحرير" الوقت (`ReleasedAt`) بدلاً من حذف السجل نهائياً، فيعود الوقت متاحاً للحجز فوراً مع بقاء السجل الكامل لتاريخ الحجوزات وتقارير لوحة التحكم — هذا يحل إشكالية شائعة: إن اكتُفي بتغيير الحالة فقط دون تحرير القيد الفريد نفسه، يبقى الوقت محجوباً للأبد.
- **تحرير تلقائي للحجوزات المعلّقة:** خدمة خلفية (`BackgroundService`) تعمل كل دقيقة وتُحرر أي حجز "بانتظار الدفع الإلكتروني" لم يُستكمل خلال 10 دقائق.
- **التحقق الفعلي من مبلغ الدفع:** لا يُعتمد على حالة "نجاح" الدفع المُرسلة من العميل أو من الـ Webhook وحدها — يُعاد الاستعلام عن الجلسة من ثواني مباشرة ومقارنة المبلغ الفعلي المدفوع بسعر الحجز قبل التأكيد.
- **التسعير المتدرج:** عدد الساعات الكلي ضمن طلب الحجز الواحد (وليس لكل يوم أو لكل ملعب) هو ما يحدد الشريحة السعرية المطبّقة على كل ساعة، حسب جدول أسعار الملعب المخصَّص لتلك الساعة تحديداً.
- **معالجة أخطاء موحدة:** Middleware مركزي يحوّل كل استثناء لاستجابة `ProblemDetails` بحالة HTTP ورسالة مرتبطة بنوعه فقط (409 لتعارض الحجز يختلف تماماً عن 409 لتعارض إداري آخر، ولا تتداخل رسائلهما).
- **واجهة عربية RTL بالكامل:** بما أن كل المتطلبات الأصلية وجمهور المنصة (Oman) عربي، صُممت الواجهتان بالكامل RTL بخط Tajawal، مع هوية بصرية مستوحاة من ملعب البادل (أخضر عميق كلون أساسي، وأصفر-أخضر نيون كلون توقيع للأزرار الرئيسية فقط)، وبطاقة تأكيد الحجز مصممة على شكل "تذكرة" كعنصر بصري مميز.
- **Rate Limiting:** على تسجيل دخول الإدارة (5 محاولات/دقيقة لكل IP) وعلى إنشاء الحجوزات (20 طلب/دقيقة لكل IP) لمنع إساءة الاستخدام.
- **Logging حقيقي:** عبر Serilog (console + ملفات) على مستوى الأحداث المهمة: تأكيد حجز، محاولة دخول فاشلة، إجراءات إدارية (إنشاء/تعديل/حذف ملعب، إلغاء حجز، إغلاق).

## ملاحظات إضافية

- أُنشئت أول Migration فعلية عبر `dotnet ef migrations add InitialCreate` منذ البداية (موجودة في `backend/src/ZPadel.Infrastructure/Persistence/Migrations`) — وليست سكربت SQL يدوي فقط.
- تم التأكد فعلياً (وليس افتراضاً) من نجاح `dotnet build` على كامل الحل، ونجاح `npm run build` على كلا تطبيقي React، بالإضافة لاختبار المسار الكامل (تصفح → اختيار أوقات → تأكيد حجز → ظهوره بلوحة التحكم → إلغاؤه → عودة الوقت متاحاً) فعلياً عبر متصفح حقيقي.
- لوحة التحكم مصممة أساساً لجهاز حاسوب/تابلت (أداة عمل داخلية)، لكنها متجاوبة أيضاً على الجوال (Layout ينتقل لشريط علوي بدل الشريط الجانبي، والجداول تُمرَّر أفقياً ضمن حاويتها).
- السعر المعروض في شاشة اختيار الأوقات تقديري (لساعة واحدة)؛ السعر النهائي الدقيق يُحتسب في شاشة إتمام الحجز عبر `POST /api/bookings/quote` مع مراعاة العروض المتدرجة، ويُثبَّت نهائياً عند التأكيد الفعلي.
