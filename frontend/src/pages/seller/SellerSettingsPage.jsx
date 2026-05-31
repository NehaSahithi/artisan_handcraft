import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Loader2, ArrowLeft, ShieldCheck, Store, MapPin, BadgeCheck } from 'lucide-react'
import { useArtisanStore } from '../../store/artisanStore'

const craftOptions = [
  'Pottery', 'Handloom', 'Woodwork', 'Jewellery', 'Painting',
  'Embroidery', 'Metalwork', 'Leatherwork', 'Bamboo & Cane',
  'Stone Carving', 'Terracotta', 'Block Printing', 'Dhokra',
  'Warli Art', 'Madhubani', 'Pattachitra', 'Other',
]

const initialProfile = {
  shopName: '',
  tagline: '',
  story: '',
  craftTradition: '',
  yearsOfExperience: '',
  generationsPracticing: '',
  village: '',
  district: '',
  state: '',
  pincode: '',
  craftCategories: [],
}

const initialKyc = {
  aadhaarNumber: '',
  panNumber: '',
  aadhaarDoc: '',
  panDoc: '',
  bankAccountNumber: '',
  ifscCode: '',
  bankName: '',
}

export default function SellerSettingsPage() {
  const { getDashboard, getMyProfile, updateProfile, submitKYC } = useArtisanStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState(initialProfile)
  const [kyc, setKyc] = useState(initialKyc)
  const [dashboard, setDashboard] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [dashboardResponse, profileResponse] = await Promise.all([
          getDashboard(),
          getMyProfile(),
        ])
        setDashboard(dashboardResponse?.stats || null)
        const existingProfile = profileResponse?.profile || {}
        setProfile((current) => ({
          ...current,
          shopName: existingProfile.shopName || '',
          tagline: existingProfile.tagline || '',
          story: existingProfile.story || '',
          craftTradition: existingProfile.craftTradition || '',
          yearsOfExperience: existingProfile.yearsOfExperience || '',
          generationsPracticing: existingProfile.generationsPracticing || '',
          village: existingProfile.village || '',
          district: existingProfile.district || '',
          state: existingProfile.state || '',
          pincode: existingProfile.pincode || '',
          craftCategories: existingProfile.craftCategories || [],
        }))
        setKyc((current) => ({
          ...current,
          aadhaarNumber: existingProfile?.kyc?.aadhaarNumber || '',
          panNumber: existingProfile?.kyc?.panNumber || '',
          aadhaarDoc: existingProfile?.kyc?.aadhaarDoc || '',
          panDoc: existingProfile?.kyc?.panDoc || '',
          bankAccountNumber: existingProfile?.kyc?.bankAccountNumber || '',
          ifscCode: existingProfile?.kyc?.ifscCode || '',
          bankName: existingProfile?.kyc?.bankName || '',
        }))
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load studio settings')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [getDashboard])

  const handleProfileChange = (event) => {
    const { name, value } = event.target
    setProfile((current) => ({ ...current, [name]: value }))
  }

  const handleKycChange = (event) => {
    const { name, value } = event.target
    setKyc((current) => ({ ...current, [name]: value }))
  }

  const toggleCraft = (craft) => {
    setProfile((current) => {
      const selected = current.craftCategories.includes(craft)
      return {
        ...current,
        craftCategories: selected
          ? current.craftCategories.filter((item) => item !== craft)
          : [...current.craftCategories, craft],
      }
    })
  }

  const saveProfile = async () => {
    setSaving(true)
    try {
      const payload = {
        ...profile,
        yearsOfExperience: profile.yearsOfExperience === '' ? undefined : Number(profile.yearsOfExperience),
        generationsPracticing: profile.generationsPracticing === '' ? undefined : Number(profile.generationsPracticing),
      }
      await updateProfile(payload)
      toast.success('Studio profile saved')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not save studio profile')
    } finally {
      setSaving(false)
    }
  }

  const saveKyc = async () => {
    setSaving(true)
    try {
      await submitKYC(kyc)
      toast.success('KYC submitted for review')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not submit KYC')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12 md:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/seller/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Studio
        </Link>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="rounded-xl border border-border bg-card p-6">
            <Store className="w-5 h-5 text-primary mb-3" />
            <div className="text-sm text-muted-foreground">Studio</div>
            <div className="text-xl font-semibold">{profile.shopName || 'Untitled Studio'}</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <MapPin className="w-5 h-5 text-primary mb-3" />
            <div className="text-sm text-muted-foreground">State</div>
            <div className="text-xl font-semibold">{profile.state || 'Not set'}</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <ShieldCheck className="w-5 h-5 text-primary mb-3" />
            <div className="text-sm text-muted-foreground">KYC</div>
            <div className="text-xl font-semibold">Ready to submit</div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <h1 className="text-3xl font-serif font-bold mb-6">Studio Profile</h1>
            <div className="grid gap-4 md:grid-cols-2">
              <input className="rounded-md border border-border bg-transparent px-4 py-3" name="shopName" value={profile.shopName} onChange={handleProfileChange} placeholder="Shop name" />
              <input className="rounded-md border border-border bg-transparent px-4 py-3" name="tagline" value={profile.tagline} onChange={handleProfileChange} placeholder="Tagline" />
              <textarea className="rounded-md border border-border bg-transparent px-4 py-3 md:col-span-2 min-h-28" name="story" value={profile.story} onChange={handleProfileChange} placeholder="Tell your artisan story" />
              <textarea className="rounded-md border border-border bg-transparent px-4 py-3 md:col-span-2 min-h-28" name="craftTradition" value={profile.craftTradition} onChange={handleProfileChange} placeholder="Craft tradition / heritage" />
              <input className="rounded-md border border-border bg-transparent px-4 py-3" name="village" value={profile.village} onChange={handleProfileChange} placeholder="Village" />
              <input className="rounded-md border border-border bg-transparent px-4 py-3" name="district" value={profile.district} onChange={handleProfileChange} placeholder="District" />
              <input className="rounded-md border border-border bg-transparent px-4 py-3" name="state" value={profile.state} onChange={handleProfileChange} placeholder="State" />
              <input className="rounded-md border border-border bg-transparent px-4 py-3" name="pincode" value={profile.pincode} onChange={handleProfileChange} placeholder="Pincode" />
              <input className="rounded-md border border-border bg-transparent px-4 py-3" name="yearsOfExperience" value={profile.yearsOfExperience} onChange={handleProfileChange} placeholder="Years of experience" type="number" />
              <input className="rounded-md border border-border bg-transparent px-4 py-3" name="generationsPracticing" value={profile.generationsPracticing} onChange={handleProfileChange} placeholder="Generations practicing" type="number" />
            </div>

            <div className="mt-6">
              <div className="text-sm font-medium mb-3">Craft categories</div>
              <div className="flex flex-wrap gap-2">
                {craftOptions.map((craft) => (
                  <button
                    key={craft}
                    type="button"
                    onClick={() => toggleCraft(craft)}
                    className={`rounded-full border px-3 py-1.5 text-sm ${profile.craftCategories.includes(craft) ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary'}`}
                  >
                    {craft}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              disabled={saving}
              onClick={saveProfile}
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-primary-foreground disabled:opacity-70"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <BadgeCheck className="w-4 h-4" />}
              Save Profile
            </button>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <h2 className="text-3xl font-serif font-bold mb-6">KYC Verification</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <input className="rounded-md border border-border bg-transparent px-4 py-3" name="aadhaarNumber" value={kyc.aadhaarNumber} onChange={handleKycChange} placeholder="Aadhaar number" />
              <input className="rounded-md border border-border bg-transparent px-4 py-3" name="panNumber" value={kyc.panNumber} onChange={handleKycChange} placeholder="PAN number" />
              <input className="rounded-md border border-border bg-transparent px-4 py-3 md:col-span-2" name="aadhaarDoc" value={kyc.aadhaarDoc} onChange={handleKycChange} placeholder="Aadhaar document URL" />
              <input className="rounded-md border border-border bg-transparent px-4 py-3 md:col-span-2" name="panDoc" value={kyc.panDoc} onChange={handleKycChange} placeholder="PAN document URL" />
              <input className="rounded-md border border-border bg-transparent px-4 py-3" name="bankAccountNumber" value={kyc.bankAccountNumber} onChange={handleKycChange} placeholder="Bank account number" />
              <input className="rounded-md border border-border bg-transparent px-4 py-3" name="ifscCode" value={kyc.ifscCode} onChange={handleKycChange} placeholder="IFSC code" />
              <input className="rounded-md border border-border bg-transparent px-4 py-3 md:col-span-2" name="bankName" value={kyc.bankName} onChange={handleKycChange} placeholder="Bank name" />
            </div>

            <button
              type="button"
              disabled={saving}
              onClick={saveKyc}
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-primary-foreground disabled:opacity-70"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              Submit KYC
            </button>
          </section>
        </div>

        {dashboard ? (
          <p className="mt-8 text-sm text-muted-foreground">Current stats: {JSON.stringify(dashboard)}</p>
        ) : null}
      </div>
    </div>
  )
}