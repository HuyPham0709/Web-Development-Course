import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { BriefcaseBusiness, ShieldAlert } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"

export function Login() {
  const navigate = useNavigate()
  const [step, setStep] = useState<"credentials" | "otp">("credentials")
  
  // State lưu trữ dữ liệu
  const [email, setEmail] = useState("admin@jobfinder.com")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  // Biến tạm để giữ Token trước khi xác thực OTP thành công
  const [tempToken, setTempToken] = useState("")

  // State lưu 6 số OTP
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""))
  // Dùng refs để điều khiển focus (nhảy ô)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    // Lấy chuỗi được dán, chỉ lọc lấy các chữ số, và cắt tối đa 6 ký tự
    const pastedData = e.clipboardData.getData("text/plain").replace(/\D/g, "").slice(0, 6)
    if (!pastedData) return

    const newOtp = [...otp]
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i]
    }
    setOtp(newOtp)
    
    // Tự động nhảy con trỏ chuột đến ô thích hợp sau khi dán
    const focusIndex = Math.min(pastedData.length, 5)
    inputRefs.current[focusIndex]?.focus()
  }
  // --- BƯỚC 1: XÁC THỰC MẬT KHẨU ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // ĐÃ SỬA: Đổi từ /login sang /admin-login
      const response = await fetch("https://web-development-course-y23i.onrender.com/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: "admin" }), 
      })

      const data = await response.json()

      if (response.ok) {
        // Ghi chú: API admin-login KHÔNG trả về token ngay, mà nó gửi OTP. 
        // Ta chỉ cần đổi step sang "otp" là được.
        setStep("otp")
        setError("")
      } else {
        setError(data.message || "Đăng nhập thất bại!")
      }
    } catch (err) {
      setError("Không thể kết nối đến máy chủ.")
    } finally {
      setIsLoading(false)
    }
  }

  // --- XỬ LÝ NHẬP OTP ---
  const handleOtpChange = (index: number, value: string) => {
    // Chỉ cho phép nhập số
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp]
    newOtp[index] = value.substring(value.length - 1) // Lấy ký tự cuối cùng
    setOtp(newOtp)

    // Tự động focus sang ô tiếp theo nếu có nhập dữ liệu
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Tự động lùi về ô trước đó khi ấn Backspace ở ô trống
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  // --- BƯỚC 2: XÁC THỰC OTP ---
const handleVerify = async (e: React.FormEvent) => {
  e.preventDefault()
  
  const otpCode = otp.join("")
  if (otpCode.length < 6) {
    setError("Vui lòng nhập đủ 6 mã số OTP")
    return
  }

  setIsLoading(true)
  setError("")

  try {
    // Gọi API kiểm tra OTP
    const response = await fetch("https://web-development-course-y23i.onrender.com/api/auth/verify-login-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp: otpCode }), 
    })

    const data = await response.json()

    if (response.ok) {
      // OTP Hợp lệ -> Backend trả về Token thật -> Lưu vào máy
      localStorage.setItem("admin_token", data.token)
      navigate("/") // Chuyển thẳng vào Admin
    } else {
      setError(data.message || "Mã OTP không chính xác!")
      // Tự động clear các ô OTP để nhập lại
      setOtp(Array(6).fill(""))
      inputRefs.current[0]?.focus()
    }
  } catch (err) {
    setError("Không thể kết nối đến máy chủ.")
  } finally {
    setIsLoading(false)
  }
}

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex flex-col items-center">
        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-200">
          <BriefcaseBusiness className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">JobFinder Admin</h1>
        <p className="text-slate-500 mt-2">Secure access portal</p>
      </div>

      <Card className="w-full max-w-md shadow-xl border-slate-200/60">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl">
            {step === "credentials" ? "Admin Login" : "Two-Factor Authentication"}
          </CardTitle>
          <CardDescription>
            {step === "credentials" 
              ? "Enter your credentials to access the system." 
              : "Enter the 6-digit code sent to your admin device."}
          </CardDescription>
        </CardHeader>
        
        {step === "credentials" ? (
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="admin@jobfinder.com" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Đang xác thực..." : "Continue securely"}
              </Button>
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md mb-4">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label>Verification Code</Label>
                <div className="flex justify-between gap-2">
                  {otp.map((digit, index) => (
                    <Input 
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      // ĐÂY LÀ DÒNG FIX LỖI 44444: Báo cho trình duyệt biết đây là ô OTP để nó đừng điền bậy
                      autoComplete="one-time-code" 
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      // THÊM DÒNG NÀY ĐỂ HỖ TRỢ COPY/PASTE
                      onPaste={handlePaste} 
                      className="w-12 h-12 text-center text-lg font-bold" 
                      maxLength={1}
                      required
                      placeholder="•"
                    />
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-3">
              <Button type="submit" className="w-full">Verify & Access</Button>
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => {
                  setStep("credentials");
                  setTempToken("");
                  setOtp(Array(6).fill("")); // Xóa OTP khi quay lại
                  setError("");
                }} 
                className="w-full"
              >
                Back to login
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>

      <div className="mt-8 flex items-center text-slate-500 text-sm bg-slate-200/50 px-4 py-2 rounded-full">
        <ShieldAlert className="w-4 h-4 mr-2 text-amber-500" />
        Internal Use Only. Unauthorized access is strictly prohibited.
      </div>
    </div>
  )
}