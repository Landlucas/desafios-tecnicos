const controlClass = 'min-h-11 rounded-lg focus-visible:outline-[.19rem] focus-visible:outline-offset-[.2rem] focus-visible:outline-[#177a61]'
const buttonClass = `${controlClass} cursor-pointer border px-[.9rem] py-[.45rem] font-[680] whitespace-nowrap disabled:cursor-default disabled:opacity-50`

export const panelClass = 'rounded-[.9rem] border border-line bg-paper p-5'
export const labelClass = 'grid min-w-0 gap-[.32rem] text-[.9rem] font-[650]'
export const fieldClass = `${controlClass} border border-[#8a9a8d] bg-white px-[.62rem] py-[.45rem] text-ink`
export const primaryButtonClass = `${buttonClass} border-transparent bg-brand text-white hover:bg-[#174331]`
export const secondaryButtonClass = `${buttonClass} border-[#91a496] bg-paper text-brand hover:bg-[#e9f2ea] disabled:hover:bg-paper`
export const feedbackClass = 'my-[.65rem] min-h-[1.65rem] rounded-[.4rem] px-[.7rem] py-[.4rem] wrap-anywhere'
export const feedbackToneClasses = {
  success: 'bg-[#e5f0e6] text-[#204c35]',
  failure: 'bg-[#f9e9e2] text-[#792e22]',
  no_change: 'bg-[#eeeade] text-[#564827]',
}
