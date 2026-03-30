import { ShieldCheck, CreditCard, Users } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: ShieldCheck,
      title: 'Kiểm định xe',
      description:
        'Tất cả xe đạp được kiểm định chất lượng trước khi đăng bán. Đảm bảo an toàn và chất lượng cho người mua với quy trình kiểm tra cẩn thận.',
    },
    {
      icon: CreditCard,
      title: 'Thanh toán an toàn',
      description:
        'Hệ thống thanh toán được bảo mật tối đa để đảm bảo an toàn cho người mua và người bán. Tiền chỉ được chuyển sau khi đã kiểm tra hàng.',
    },
    {
      icon: Users,
      title: 'Cộng đồng lớn',
      description:
        'Hệ thống dành cho cộng đồng yêu thích xe đạp, chia sẻ kinh nghiệm và kết nối với những người có cùng đam mê trên khắp cả nước.',
    },
  ];

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">Tại sao chọn chúng tôi?</h2>
          <p className="text-base text-gray-600">
            Nền tảng mua bán xe đạp uy tín với nhiều ưu điểm nổi bật giúp người dùng yên tâm giao dịch
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="mb-3 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;