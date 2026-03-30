'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export const CustomerSignContractView: React.FC = () => {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [hasAgreed, setHasAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [timestamp] = useState(() => new Date());

  // Resize canvas to match container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = rect.width;
      canvas.height = rect.height;
      ctx.putImageData(imageData, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/login');
    }
  };

  const handlePointerDown: React.PointerEventHandler<HTMLCanvasElement> = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.strokeStyle = '#1d4ed8';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);

    setIsDrawing(true);
    setHasSignature(true);
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove: React.PointerEventHandler<HTMLCanvasElement> = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const endDrawing: React.PointerEventHandler<HTMLCanvasElement> = (e) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    try {
      (e.target as HTMLCanvasElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    // Lưu lại chữ ký hiện tại dưới dạng ảnh để hiển thị trong hợp đồng
    const canvas = canvasRef.current;
    if (canvas) {
      try {
        const dataUrl = canvas.toDataURL('image/png');
        setSignatureDataUrl(dataUrl);
        setHasSignature(true);
      } catch {
        // ignore canvas export errors
      }
    }
  };

  const handleClearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setSignatureDataUrl(null);
  };

  const handleSubmit = async () => {
    if (!hasSignature || !hasAgreed) {
      setSubmitError('Vui lòng ký vào ô chữ ký và xác nhận đã đọc điều khoản trước khi tiếp tục.');
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      // Giả lập gọi API ký hợp đồng
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitSuccess(true);
    } catch (err) {
      console.error(err);
      setSubmitError('Có lỗi xảy ra khi ký hợp đồng. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedTime = timestamp.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="bg-background-light dark:bg-background-dark text-[#0d121b] dark:text-white font-display min-h-screen flex flex-col">
      {/* Header Section */}
      <header className="shrink-0 bg-white dark:bg-[#1a202c] border-b border-[#cfd7e7] dark:border-gray-800 z-10">
        <div className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
            >
              <span className="material-symbols-outlined text-base md:text-[20px]">arrow_back</span>
            </button>
            <div className="flex flex-col">
              <h1 className="text-[#0d121b] dark:text-white text-base md:text-xl font-bold leading-tight">
                Ký Hợp đồng Vay
              </h1>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-[10px] md:text-xs font-bold uppercase tracking-wider">
                  Chờ ký
                </span>
                <p className="text-[#4c669a] dark:text-gray-400 text-xs md:text-sm font-medium">
                  Mã hợp đồng: #LOAN-123456
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="hidden sm:flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-9 md:h-10 px-3 md:px-4 bg-[#e7ebf3] dark:bg-gray-800 text-[#0d121b] dark:text-gray-200 text-xs md:text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="truncate">Hủy bỏ</span>
            </button>
            <button
              onClick={handleBack}
              className="sm:hidden flex items-center justify-center w-9 h-9 rounded-lg bg-[#e7ebf3] dark:bg-gray-800 text-[#0d121b] dark:text-gray-200"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden flex-col lg:flex-row">
        {/* Left: Contract viewer */}
        <section className="flex-1 bg-gray-100 dark:bg-[#0f141e] relative overflow-hidden flex flex-col">
          {/* Toolbar */}
          <div className="h-10 md:h-12 bg-white/50 dark:bg-[#1a202c]/50 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 md:px-6 shrink-0 z-10">
            <span className="text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Xem trước tài liệu
            </span>
            <div className="flex items-center gap-1.5 md:gap-2 text-gray-500 dark:text-gray-400 text-[10px] md:text-xs">
              <span className="material-symbols-outlined text-xs md:text-sm">print</span>
              <span className="font-medium hidden sm:inline">In bản nháp</span>
            </div>
          </div>

          {/* Scrollable paper */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 md:p-4 lg:p-8 flex justify-center">
            <div className="bg-white text-gray-900 shadow-xl w-full max-w-[800px] min-h-[900px] md:min-h-[1000px] p-4 md:p-8 lg:p-12 rounded-sm border border-gray-200 mb-8 select-none">
              {/* Contract content (rút gọn, giữ layout chính) */}
              <div className="flex flex-col gap-6">
                <div className="text-center space-y-1 mb-6 md:mb-8">
                  <h2 className="text-sm md:text-lg font-bold uppercase">
                    Cộng hòa xã hội chủ nghĩa Việt Nam
                  </h2>
                  <p className="text-xs md:text-sm font-bold underline underline-offset-4">
                    Độc lập - Tự do - Hạnh phúc
                  </p>
                </div>

                <div className="text-center mb-4 md:mb-6">
                  <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight">
                    Hợp Đồng Tín Dụng Tiêu Dùng
                  </h1>
                  <p className="text-xs md:text-sm italic text-gray-500 mt-1 md:mt-2">
                    Số: 123456/2023/HĐTD-FIN
                  </p>
                </div>

                <div className="space-y-4 text-xs md:text-sm leading-relaxed text-justify">
                  <p>Hôm nay, ngày 24 tháng 05 năm 2024, tại TP. Hồ Chí Minh, chúng tôi gồm có:</p>

                  <div className="bg-gray-50 p-3 md:p-4 rounded border border-gray-100">
                    <h3 className="font-bold mb-2">
                      BÊN A (BÊN CHO VAY): CÔNG TY TÀI CHÍNH ABC
                    </h3>
                    <p>Địa chỉ: Tầng 12, Tòa nhà Bitexco, Q.1, TP.HCM</p>
                    <p>Đại diện: Ông Trần Văn B - Chức vụ: Giám đốc Khối Tín dụng</p>
                  </div>

                  <div className="bg-blue-50/50 p-3 md:p-4 rounded border border-blue-100">
                    <h3 className="font-bold mb-2 text-blue-700">
                      BÊN B (BÊN VAY): NGUYỄN VĂN A
                    </h3>
                    <p>CMND/CCCD: 079xxxxxxxxx - Cấp ngày: 01/01/2020</p>
                    <p>Địa chỉ thường trú: 123 Đường Nguyễn Huệ, Quận 1, TP.HCM</p>
                  </div>

                  <p className="font-bold mt-4">ĐIỀU 1: SỐ TIỀN VAY VÀ MỤC ĐÍCH VAY</p>
                  <p>
                    1.1. Bên A đồng ý cho Bên B vay số tiền là:{' '}
                    <span className="font-bold">50.000.000 VNĐ</span> (Bằng chữ: Năm mươi triệu
                    đồng chẵn).
                  </p>
                  <p>1.2. Mục đích vay: Tiêu dùng cá nhân.</p>
                  <p>1.3. Thời hạn vay: 24 tháng kể từ ngày giải ngân.</p>

                  <p className="font-bold mt-4">ĐIỀU 2: LÃI SUẤT VÀ PHƯƠNG THỨC TRẢ NỢ</p>
                  <p>2.1. Lãi suất cho vay: 1.5%/tháng tính trên dư nợ giảm dần.</p>
                  <p>2.2. Phương thức trả nợ: Trả góp gốc và lãi hàng tháng vào ngày 05 dương lịch.</p>
                  <p>2.3. Phí phạt quá hạn: 150% lãi suất trong hạn tính trên số tiền chậm trả.</p>

                  <p className="font-bold mt-4">ĐIỀU 3: QUYỀN VÀ NGHĨA VỤ CỦA BÊN B</p>
                  <p>3.1. Sử dụng vốn vay đúng mục đích đã cam kết.</p>
                  <p>3.2. Thanh toán đầy đủ nợ gốc, lãi và các khoản phí phát sinh (nếu có) đúng hạn.</p>
                  <p>3.3. Chịu trách nhiệm trước pháp luật về tính chính xác của các thông tin đã cung cấp.</p>

                  <div className="opacity-50 pointer-events-none select-none blur-[0.5px]">
                    <p className="mt-4">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                      incididunt ut labore et dolore magna aliqua...
                    </p>
                  </div>
                </div>

                <div className="mt-8 md:mt-12 flex justify-between items-end pt-8 md:pt-12">
                  <div className="text-center w-1/3">
                    <p className="font-bold uppercase text-[10px] md:text-xs mb-10 md:mb-16">
                      Đại diện bên A
                    </p>
                    <div className="h-8 md:h-10" />
                    <p className="font-bold text-xs md:text-sm">Trần Văn B</p>
                  </div>
                  <div className="text-center w-1/3">
                    <p className="font-bold uppercase text-[10px] md:text-xs mb-10 md:mb-16">
                      Đại diện bên B
                    </p>
                    {signatureDataUrl ? (
                      <div className="flex justify-center mb-1" style={{ height: '100px' }}>
                        <img
                          src={signatureDataUrl}
                          alt="Chữ ký khách hàng"
                          className="h-12 md:h-14 object-contain"
                          style={{ height: '100px', overflow: 'visible' }}
                        />
                      </div>
                    ) : (
                      <div
                        className="text-blue-600 bg-blue-50 border border-dashed border-blue-200 rounded px-3 py-2.5 text-[10px] md:text-xs"
                        style={{ height: '150px' }}
                      >
                        Chờ chữ ký điện tử...
                      </div>
                    )}
                    <p className="font-bold text-xs md:text-sm mt-2">Nguyễn Văn A</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right: actions */}
        <aside className="w-full lg:w-[360px] xl:w-[400px] shrink-0 bg-white dark:bg-[#1a202c] border-l border-[#cfd7e7] dark:border-gray-800 flex flex-col h-[50vh] lg:h-auto overflow-y-auto shadow-2xl lg:shadow-none z-20">
          <div className="p-4 md:p-6 flex flex-col gap-5 flex-1">
            {/* Summary */}
            <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 p-4">
              <h3 className="text-[#0d121b] dark:text-white text-sm md:text-base font-bold mb-3 md:mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">info</span>
                Thông tin tóm tắt
              </h3>
              <div className="grid grid-cols-[90px_1fr] md:grid-cols-[100px_1fr] gap-y-2.5 gap-x-2 text-xs md:text-sm">
                <p className="text-[#4c669a] dark:text-gray-400">Khách hàng</p>
                <p className="text-[#0d121b] dark:text-white font-medium text-right">
                  Nguyễn Văn A
                </p>
                <div className="col-span-2 h-px bg-gray-200 dark:bg-gray-700" />
                <p className="text-[#4c669a] dark:text-gray-400">Số tiền vay</p>
                <p className="text-blue-600 dark:text-blue-300 font-bold text-right text-sm md:text-base">
                  50.000.000 ₫
                </p>
                <div className="col-span-2 h-px bg-gray-200 dark:bg-gray-700" />
                <p className="text-[#4c669a] dark:text-gray-400">Thời hạn</p>
                <p className="text-[#0d121b] dark:text-white font-medium text-right">
                  24 Tháng
                </p>
              </div>
            </div>

            {/* Signature pad */}
            <div className="flex flex-col gap-2.5 md:gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[#0d121b] dark:text-white text-sm md:text-base font-bold">
                  Chữ ký điện tử
                </h3>
                <button
                  type="button"
                  onClick={handleClearSignature}
                  className="text-blue-600 text-[11px] md:text-xs font-bold hover:underline disabled:opacity-40"
                  disabled={!hasSignature}
                >
                  Xóa chữ ký
                </button>
              </div>
              <div className="relative group cursor-crosshair">
                <canvas
                  ref={canvasRef}
                  className="w-full h-32 md:h-40 bg-white dark:bg-[#0f141e] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg relative overflow-hidden transition-colors hover:border-blue-500/60"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={endDrawing}
                  onPointerLeave={endDrawing}
                />
                {!hasSignature && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <p className="text-gray-400 text-xs md:text-sm select-none group-hover:text-blue-500/70">
                      Vẽ chữ ký của bạn vào đây
                    </p>
                  </div>
                )}
                <div className="absolute bottom-1.5 right-2 opacity-50 text-[9px] md:text-[10px] text-gray-400">
                  IP: 192.168.1.10 - Time: {formattedTime}
                </div>
              </div>
              <p className="text-[11px] md:text-xs text-gray-500 dark:text-gray-400 italic">
                Vui lòng sử dụng chuột hoặc màn hình cảm ứng để ký.
              </p>
            </div>

            {/* Consent */}
            <div className="py-1">
              <label className="flex gap-x-3 cursor-pointer group items-start">
                <input
                  type="checkbox"
                  checked={hasAgreed}
                  onChange={(e) => setHasAgreed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 md:h-5 md:w-5 shrink-0 rounded border-[#cfd7e7] dark:border-gray-600 border-2 bg-transparent text-blue-600 checked:bg-blue-600 checked:border-blue-600 focus:ring-0 focus:ring-offset-0 focus:outline-none transition-all"
                />
                <p className="text-[#0d121b] dark:text-gray-200 text-xs md:text-sm font-normal leading-relaxed group-hover:text-blue-600 transition-colors">
                  Tôi xác nhận đã đọc, hiểu và đồng ý với toàn bộ các điều khoản và điều kiện được
                  nêu trong hợp đồng vay vốn này.
                </p>
              </label>
            </div>

            {submitError && (
              <div className="mt-2 text-[11px] md:text-xs text-red-600">
                {submitError}
              </div>
            )}
            {submitSuccess && (
              <div className="mt-2 text-[11px] md:text-xs text-green-600">
                Hợp đồng đã được ký thành công. Bạn có thể lưu/đóng trang này.
              </div>
            )}

            <div className="lg:flex-1" />
          </div>

          {/* Bottom actions */}
          <div className="p-4 md:p-6 border-t border-[#cfd7e7] dark:border-gray-800 bg-gray-50 dark:bg-[#151b26]">
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 md:h-12 px-4 md:px-5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm md:text-base font-bold leading-normal tracking-[0.015em] shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] disabled:active:scale-100 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined mr-2 text-[18px] md:text-[20px]">
                  edit_document
                </span>
                <span className="truncate">
                  {isSubmitting ? 'Đang xử lý...' : 'Xác nhận & Ký Hợp đồng'}
                </span>
              </button>
              <div className="flex items-center justify-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-gray-500 dark:text-gray-400">
                <span className="material-symbols-outlined text-[12px] md:text-[14px]">lock</span>
                <span>Được bảo mật bằng mã hóa 256-bit SSL</span>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};


