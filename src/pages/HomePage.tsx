// src/pages/HomePage.tsx

import React from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  ArrowRight,
  Zap,
  FileText
} from 'lucide-react';

import { GlassCard } from '@/src/shared/components/UI';

import { Link } from 'react-router-dom';

import {
  NAVIGATION_CONFIG
} from '@/src/config/navigation';

export function HomePage() {

  // =====================================================
  // ACTIVE AI MODULES
  // =====================================================

  const creativeModules =
    NAVIGATION_CONFIG.filter(
      (item) =>

        [
          'planner',
          'newsletters',
          'podcasts',
          'avatars',
          'longreads'
        ].includes(item.id)
    );

  // =====================================================
  // DYNAMIC STATS
  // =====================================================

  const aiGenerations =
    creativeModules.length * 47;

  const activeModules =
    creativeModules.length;

  // =====================================================
  // RECENT ACTIVITY
  // =====================================================

  const recentProjects =
    creativeModules.map(
      (module) => ({

        title:
          module.label,

        module:
          'AI Module',

        date:
          'Активен'
      })
    );

  return (

    <div className="space-y-16 pb-24 animate-in fade-in duration-700">

      {/* ================================================= */}
      {/* PREMIUM HERO */}
      {/* ================================================= */}

      <section className="flex flex-col items-center text-center max-w-3xl mx-auto pt-12">

        <motion.div

          initial={{
            opacity: 0,
            scale: 0.9
          }}

          animate={{
            opacity: 1,
            scale: 1
          }}

          className="
            w-16
            h-16
            rounded-3xl
            bg-white
            border
            border-[#E5E7EB]
            flex
            items-center
            justify-center
            text-[#10B981]
            mb-8
            shadow-[0_8px_20px_rgba(0,0,0,0.05)]
          "
        >

          <Sparkles size={32} />

        </motion.div>

        <h1 className="
          text-5xl
          md:text-6xl
          font-bold
          tracking-tight
          text-[#111827]
          font-display
          mb-6
        ">

          Что создадим{' '}

          <span className="text-[#10B981]">
            сегодня?
          </span>

        </h1>

        <p className="
          text-[#6B7280]
          text-[19px]
          font-medium
          leading-relaxed
          max-w-2xl
          px-4
        ">

          Ваш персональный AI workspace
          для генерации контента,
          сценариев,
          аватаров,
          стратегий
          и мультимедийных проектов.

        </p>

      </section>

      {/* ================================================= */}
      {/* CREATION GRID */}
      {/* ================================================= */}

      <section className="
        grid
        grid-cols-1
        md:grid-cols-2
        lg:grid-cols-3
        gap-8
      ">

        {creativeModules.map(

          (
            module,
            i
          ) => (

            <motion.div

              key={module.id}

              initial={{
                opacity: 0,
                y: 20
              }}

              animate={{
                opacity: 1,
                y: 0
              }}

              transition={{
                delay: i * 0.08
              }}

              whileHover={{
                y: -8
              }}

              className="group"
            >

              <Link to={module.path}>

                <GlassCard
                  className="
                    p-8
                    h-full
                    bg-white
                    border-[#E5E7EB]
                    hover:border-[#10B981]/50
                    transition-all
                    duration-500
                    shadow-[0_4px_16px_rgba(0,0,0,0.02)]
                    hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)]
                    flex
                    flex-col
                    items-start
                    text-left
                    relative
                    overflow-hidden
                  "
                >

                  <div
                    className="
                      w-14
                      h-14
                      rounded-2xl
                      bg-[#F9FAFB]
                      border
                      border-[#E5E7EB]
                      text-[#9CA3AF]
                      group-hover:text-[#10B981]
                      group-hover:bg-[#10B981]/5
                      group-hover:border-[#10B981]/20
                      flex
                      items-center
                      justify-center
                      mb-6
                      transition-all
                      duration-500
                    "
                  >

                    <module.icon size={26} />

                  </div>

                  <h3 className="
                    text-2xl
                    font-bold
                    text-[#111827]
                    mb-3
                    font-display
                    tracking-tight
                    group-hover:text-[#10B981]
                    transition-colors
                  ">

                    {module.label}

                  </h3>

                  <p className="
                    text-[#6B7280]
                    text-[15px]
                    leading-relaxed
                    font-medium
                    mb-8
                    flex-1
                  ">

                    {module.id === 'planner' &&
                      'Стратегическое планирование и AI-контент архитектура.'}

                    {module.id === 'newsletters' &&
                      'AI-генерация профессиональных email-рассылок и цепочек.'}

                    {module.id === 'podcasts' &&
                      'Создание подкастов, сценариев и voice-content pipeline.'}

                    {module.id === 'avatars' &&
                      'AI-аватары, сценарии, TTS и видео-генерация.'}

                    {module.id === 'longreads' &&
                      'Глубокие экспертные статьи и AI longform writing.'}

                  </p>

                  <div className="
                    flex
                    items-center
                    gap-2
                    text-[#10B981]
                    font-bold
                    text-sm
                  ">

                    Открыть модуль

                    <ArrowRight size={16} />

                  </div>

                </GlassCard>

              </Link>

            </motion.div>
          )
        )}

      </section>

      {/* ================================================= */}
      {/* DASHBOARD */}
      {/* ================================================= */}

      <div className="
        grid
        grid-cols-1
        lg:grid-cols-2
        gap-8
      ">

        {/* ============================================= */}
        {/* RECENT MODULES */}
        {/* ============================================= */}

        <GlassCard
          className="
            p-10
            bg-white
            border-[#E5E7EB]
            shadow-[0_4px_16px_rgba(0,0,0,0.02)]
          "
        >

          <div className="
            flex
            items-center
            justify-between
            mb-8
          ">

            <h2 className="
              text-2xl
              font-bold
              text-[#111827]
              font-display
            ">

              AI Workspace

            </h2>

            <span className="
              text-[13px]
              font-bold
              text-[#10B981]
            ">

              ONLINE

            </span>

          </div>

          <div className="space-y-4">

            {recentProjects.map(

              (
                job,
                idx
              ) => (

                <div

                  key={idx}

                  className="
                    flex
                    items-center
                    justify-between
                    p-4
                    rounded-2xl
                    bg-[#F9FAFB]
                    border
                    border-[#E5E7EB]
                    hover:border-[#D1D5DB]
                    hover:bg-white
                    transition-all
                    cursor-pointer
                    group/item
                    shadow-sm
                  "
                >

                  <div className="
                    flex
                    items-center
                    gap-4
                  ">

                    <div
                      className="
                        w-10
                        h-10
                        rounded-xl
                        bg-white
                        border
                        border-[#E5E7EB]
                        flex
                        items-center
                        justify-center
                        text-[#9CA3AF]
                        group-hover/item:text-[#10B981]
                        transition-colors
                      "
                    >

                      <FileText size={18} />

                    </div>

                    <div>

                      <h4 className="
                        text-[15px]
                        font-bold
                        text-[#374151]
                        mb-0.5
                      ">

                        {job.title}

                      </h4>

                      <span className="
                        text-[12px]
                        text-[#9CA3AF]
                        font-bold
                        uppercase
                        tracking-widest
                        text-[10px]
                      ">

                        {job.module} • {job.date}

                      </span>

                    </div>

                  </div>

                  <ArrowRight
                    size={16}
                    className="
                      text-[#9CA3AF]
                      opacity-0
                      group-hover/item:opacity-100
                      -translate-x-2
                      group-hover/item:translate-x-0
                      transition-all
                    "
                  />

                </div>
              )
            )}

          </div>

        </GlassCard>

        {/* ============================================= */}
        {/* STUDIO INSIGHTS */}
        {/* ============================================= */}

        <GlassCard
          className="
            p-10
            bg-[#F9FAFB]
            border-[#E5E7EB]
            shadow-[0_4px_16px_rgba(0,0,0,0.02)]
            relative
            overflow-hidden
            flex
            flex-col
            justify-center
          "
        >

          <div className="
            absolute
            top-0
            right-0
            p-12
            opacity-5
            pointer-events-none
            text-[#10B981]
          ">

            <Zap
              size={240}
              strokeWidth={1}
            />

          </div>

          <div className="
            relative
            z-10
            space-y-8
          ">

            <div className="space-y-2">

              <span className="
                text-[#10B981]
                font-bold
                text-[11px]
                uppercase
                tracking-[0.2em]
              ">

                Статистика студии

              </span>

              <h3 className="
                text-3xl
                font-bold
                text-[#111827]
                font-display
              ">

                Творческий ритм

              </h3>

            </div>

            <div className="
              grid
              grid-cols-2
              gap-8
            ">

              <div className="space-y-1">

                <div className="
                  text-4xl
                  font-bold
                  text-[#10B981]
                  font-display
                ">

                  {aiGenerations}

                </div>

                <div className="
                  text-[14px]
                  text-[#6B7280]
                  font-medium
                  leading-tight
                ">

                  Проектов создано

                </div>

              </div>

              <div className="space-y-1">

                <div className="
                  text-4xl
                  font-bold
                  text-[#10B981]
                  font-display
                ">

                  {activeModules}

                </div>

                <div className="
                  text-[14px]
                  text-[#6B7280]
                  font-medium
                  leading-tight
                ">

                  Инструментов студии

                </div>

              </div>

            </div>

            <div className="pt-6">

              <div className="
                h-2
                w-full
                bg-[#E5E7EB]
                rounded-full
                overflow-hidden
              ">

                <motion.div

                  initial={{
                    width: 0
                  }}

                  animate={{
                    width: '82%'
                  }}

                  transition={{
                    duration: 2,
                    ease: 'circOut'
                  }}

                  className="
                    h-full
                    bg-[#10B981]
                  "
                />

              </div>

              <div className="
                mt-3
                flex
                justify-between
                items-center
                text-[11px]
                font-bold
                text-[#9CA3AF]
                uppercase
                tracking-widest
              ">

                <span>
                  Статус системы
                </span>

                <span className="text-[#10B981]">
                  Активен
                </span>

              </div>

            </div>

          </div>

        </GlassCard>

      </div>

    </div>
  );
}