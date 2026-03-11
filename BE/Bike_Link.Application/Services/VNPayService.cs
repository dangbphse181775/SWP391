using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace Bike_Link.Application.Services
{
    public class VNPayService
    {
        private readonly IConfiguration _config;

        public VNPayService(IConfiguration config)
        {
            _config = config;
        }

        public string CreatePaymentUrl(string txnRef, decimal amount, HttpContext context)
        {
            var vnpay = new SortedDictionary<string, string>();
            vnpay.Add("vnp_Version", "2.1.0");
            vnpay.Add("vnp_Command", "pay");
            vnpay.Add("vnp_TmnCode", _config["VNPay:TmnCode"]);
            vnpay.Add("vnp_Amount", ((long)(amount * 100)).ToString());
            vnpay.Add("vnp_CreateDate", DateTime.Now.ToString("yyyyMMddHHmmss"));
            vnpay.Add("vnp_CurrCode", "VND");
            vnpay.Add("vnp_IpAddr", "127.0.0.1"); // fix cứng
            vnpay.Add("vnp_Locale", "vn");
            vnpay.Add("vnp_OrderInfo", "Naptien");
            vnpay.Add("vnp_OrderType", "other");
            vnpay.Add("vnp_ReturnUrl", _config["VNPay:ReturnUrl"]);
            vnpay.Add("vnp_IpnUrl", _config["VNPay:IpnUrl"]);
            vnpay.Add("vnp_TxnRef", txnRef);

            // BƯỚC 1: Tạo chuỗi Query và đồng thời là chuỗi để băm
            StringBuilder data = new StringBuilder();
            foreach (KeyValuePair<string, string> kv in vnpay)
            {
                if (!string.IsNullOrEmpty(kv.Value))
                {
                    // Quan trọng: Phải dùng WebUtility.UrlEncode cho cả key và value
                    data.Append(WebUtility.UrlEncode(kv.Key) + "=" + WebUtility.UrlEncode(kv.Value) + "&");
                }
            }

            // BƯỚC 2: Xử lý chuỗi cuối cùng
            string queryString = data.ToString().TrimEnd('&');

            // BƯỚC 3: ÉP DẤU CỘNG THÀNH %20 (VNPAY bắt buộc điều này)
            queryString = queryString.Replace("+", "%20");

            // BƯỚC 4: Băm trên chính chuỗi queryString này
            string vnp_SecureHash = HmacSHA512(_config["VNPay:HashSecret"], queryString);

            // BƯỚC 5: Trả về URL hoàn chỉnh
            return _config["VNPay:BaseUrl"] + "?" + queryString + "&vnp_SecureHash=" + vnp_SecureHash;
        }

        private string HmacSHA512(string key, string data)
        {
            var keyBytes = Encoding.UTF8.GetBytes(key);

            using var hmac = new HMACSHA512(keyBytes);

            var hashBytes = hmac.ComputeHash(
                Encoding.UTF8.GetBytes(data));

            return BitConverter.ToString(hashBytes)
                .Replace("-", "")
                .ToUpper();
        }

        public bool ValidateSignature(IQueryCollection query)
        {
            var vnp = new SortedDictionary<string, string>();
            string vnp_SecureHash = query["vnp_SecureHash"];

            foreach (var kv in query)
            {
                // Chỉ lấy các tham số bắt đầu bằng vnp_ và loại bỏ SecureHash
                if (!string.IsNullOrEmpty(kv.Key) && kv.Key.StartsWith("vnp_") && kv.Key != "vnp_SecureHash")
                {
                    // Lấy giá trị đầu tiên và gán vào Dictionary
                    vnp[kv.Key] = kv.Value.ToString();
                }
            }

            StringBuilder data = new StringBuilder();
            foreach (KeyValuePair<string, string> kv in vnp)
            {
                if (!string.IsNullOrEmpty(kv.Value))
                {
                    // Tái tạo lại chuỗi băm giống hệt lúc gửi đi
                    data.Append(WebUtility.UrlEncode(kv.Key) + "=" + WebUtility.UrlEncode(kv.Value) + "&");
                }
            }

            // Quan trọng: Bỏ dấu & cuối và ép dấu + thành %20
            string signData = data.ToString().TrimEnd('&').Replace("+", "%20");

            // Băm lại với Secret Key
            string checkHash = HmacSHA512(_config["VNPay:HashSecret"], signData);

            // So sánh chữ ký từ VNPAY và chữ ký tự tính toán
            return checkHash.Equals(vnp_SecureHash, StringComparison.OrdinalIgnoreCase);
        }
    }
}
