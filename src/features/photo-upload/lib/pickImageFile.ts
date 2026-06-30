// 파일 선택 다이얼로그를 열어 선택한 이미지의 object URL을 콜백 (러프 업로드)
export function pickImageFile(onPick: (url: string) => void) {
  const input = document.createElement("input")
  input.type = "file"
  input.accept = "image/*"
  input.onchange = () => {
    const file = input.files?.[0]
    if (file) onPick(URL.createObjectURL(file))
  }
  input.click()
}
