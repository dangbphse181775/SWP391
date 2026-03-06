using Bike_Link.Application.IService;

namespace BikeLink.BackgroundServices
{
    /// <summary>
    /// Background service chạy mỗi 30 phút để kiểm tra và xử lý
    /// các đơn cọc quá hạn 72h
    /// </summary>
    public class DepositExpiryService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<DepositExpiryService> _logger;

        public DepositExpiryService(
            IServiceScopeFactory scopeFactory,
            ILogger<DepositExpiryService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("DepositExpiryService started.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = _scopeFactory.CreateScope();
                    var orderService = scope.ServiceProvider
                        .GetRequiredService<IOrderService>();

                    await orderService.ProcessExpiredDepositsAsync();

                    _logger.LogInformation(
                        "Processed expired deposits at {Time}", DateTime.UtcNow);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex,
                        "Error processing expired deposits at {Time}", DateTime.UtcNow);
                }

                // Chờ 30 phút rồi kiểm tra lại
                await Task.Delay(TimeSpan.FromMinutes(30), stoppingToken);
            }
        }
    }
}
