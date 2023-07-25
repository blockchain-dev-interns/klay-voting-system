/**
 * @since 2023/07/16
 * @author ThinhHV <thinh@thinhhv.com>
 * @description description
 * @copyright (c) 2023 Company Platform
 */

'use client'

import Link from 'next/link'
import useScroll from '@/lib/hooks/use-scroll'
import { useSignInModal } from './sign-in-modal'
import UserDropdown from './user-dropdown'
import { Session } from 'next-auth'
import Button from '../shared/button'

export default function NavBar({ session }: { session: Session | null }) {
  const { SignInModal, setShowSignInModal } = useSignInModal()
  const scrolled = useScroll(50)

  return (
    <>
      <SignInModal />
      <div
        className={`fixed top-0 flex w-full justify-center ${
          scrolled ? 'border-b border-gray-200 bg-white/50 backdrop-blur-xl' : 'bg-white/0'
        } z-30 transition-all`}
      >
        <div className="relative flex flex-wrap items-center justify-between gap-6 py-2 w-full md:w-4/5 md:max-w-5xl md:gap-0 md:py-4">
          <input
            aria-hidden="true"
            type="checkbox"
            name="toggle_nav"
            id="toggle_nav"
            className="peer hidden"
          />
          <div className="relative z-20 flex w-full justify-between md:px-0 lg:w-max">
            <Link href="/" className="flex items-center font-display text-2xl pl-5 md:pl-0">
              <p>Designer Voting</p>
            </Link>
            <div className="relative flex max-h-10 items-center lg:hidden">
              <label
                role="button"
                htmlFor="toggle_nav"
                aria-label="humburger"
                id="hamburger"
                className="relative p-6"
              >
                <div
                  aria-hidden="true"
                  id="line"
                  className="m-auto h-0.5 w-5 rounded bg-sky-900 transition duration-300 dark:bg-gray-300"
                ></div>
                <div
                  aria-hidden="true"
                  id="line2"
                  className="m-auto mt-2 h-0.5 w-5 rounded bg-sky-900 transition duration-300 dark:bg-gray-300"
                ></div>
              </label>
            </div>
          </div>
          <div
            aria-hidden="true"
            className="fixed inset-0 z-10 h-screen w-screen origin-bottom scale-y-0 bg-white/70 backdrop-blur-2xl transition duration-500 peer-checked:origin-top peer-checked:scale-y-100 dark:bg-gray-900/70 lg:hidden"
          ></div>
          <div
            className="invisible absolute left-0 top-0 z-20 w-full origin-top translate-y-1 scale-95 flex-col flex-wrap justify-end gap-6 rounded-3xl border  border-gray-100 bg-white p-8 opacity-0 shadow-2xl shadow-gray-600/10 transition-all 
                            duration-300 peer-checked:visible peer-checked:top-full peer-checked:scale-100 peer-checked:opacity-100 dark:border-gray-700 dark:bg-gray-800 dark:shadow-none lg:visible lg:relative lg:flex lg:w-7/12 lg:translate-y-0 lg:scale-100 lg:flex-row
                            lg:items-center lg:gap-0 lg:border-none lg:bg-transparent 
                            lg:p-0 lg:opacity-100 lg:shadow-none lg:peer-checked:translate-y-0"
          >
            <div className="w-full text-gray-600 dark:text-gray-300 lg:w-auto lg:pr-4 lg:pt-0">
              <ul className="flex flex-col items-center gap-6 font-medium tracking-wide lg:flex-row lg:gap-0 lg:text-sm">
                <li>
                  <a href="#features" className="hover:text-primary block transition md:px-4">
                    <span>Features</span>
                  </a>
                </li>
                <li>
                  <a href="#solution" className="hover:text-primary block transition md:px-4">
                    <span>Solution</span>
                  </a>
                </li>
                <li>
                  <a href="#testimonials" className="hover:text-primary block transition md:px-4">
                    <span>Testimonials</span>
                  </a>
                </li>
                <li>
                  <a href="#blog" className="hover:text-primary block transition md:px-4">
                    <span>Blog</span>
                  </a>
                </li>
                <li className="w-full md:w-auto">
                  {session ? (
                    <UserDropdown session={session} />
                  ) : (
                    <Button
                      className="w-full md:w-auto"
                      onClick={() => setShowSignInModal(true)}
                    >
                      Login
                    </Button>
                  )}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
