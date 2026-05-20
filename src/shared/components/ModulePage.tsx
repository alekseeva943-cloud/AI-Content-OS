import React, {
  useState,
  useEffect
} from 'react';

import {
  motion,
  AnimatePresence
} from 'motion/react';

import {
  RotateCcw,
  Sparkles,
  Wand2,
  AlertCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Settings2,
  History,
  Trash2,
  Plus,
  Minus
} from 'lucide-react';

import {
  GlassCard,
  Button
} from '@/src/shared/components/UI';

import {
  EmptyResultState,
  GenerationLoader
} from '@/src/shared/components/ResultPanel';

import {
  AIField,
  AIInput,
  AITextarea,
  AISelect,
  AIToggleGroup,
  AIPillSelector,
  AIDateInput
} from './forms/FormComponents';

import {
  ModuleConfig
} from '@/src/config/modules';

import {
  detectCampaignVariables,
  generateCampaign,
  generateContentPlan,
  generateLongread,
  generatePodcast,
  generateVideoAvatar
} from '@/src/services/ai/client';

import {
  useMemoryStore
} from '@/src/stores/memoryStore';

import {
  useFavoritesStore
} from '@/src/stores/favoritesStore';

import {
  useWorkspaceStore
} from '@/src/stores/workspaceStore';

import {
  useBrandStore
} from '@/src/stores/brandStore';

import {
  toast
} from 'sonner';

import {
  PlannerResultDisplay
} from '@/src/features/planner/components/PlannerResult';

import {
  CampaignResultDisplay
} from '@/src/features/newsletter/components/CampaignResult';

import {
  LongreadResultDisplay
} from '@/src/features/longreads/components/LongreadResult';

import {
  PodcastResultDisplay
} from '@/src/features/podcasts/components/PodcastResult';

import {
  VideoAvatarResultDisplay
} from '@/src/features/videoAvatar/components/VideoAvatarResult';

import {
  VariableRequirement
} from '@/src/types/newsletter';

import {
  useNavigate,
  useLocation
} from 'react-router-dom';

import {
  cn
} from '@/src/lib/utils';

import {
  AdvancedSettings,
  AdvancedSettingsState
} from '@/src/features/planner/components/AdvancedSettings';

const moduleLabels: Record<
  string,
  string
> = {
  planner: 'Планировщик',
  newsletters:
    'Publishing Studio',
  podcasts: 'Подкасты',
  avatars: 'AI-Аватары',
  longreads: 'Лонгриды',
};

interface ModulePageProps {
  config: ModuleConfig;
}

export function ModulePage({
  config
}: ModulePageProps) {

  const {
    modules,
    setModuleState,
    clearModule
  } = useWorkspaceStore();

  const brandVariables =
    useBrandStore(
      state => state.variables
    );

  const history =
    useMemoryStore(
      state => state.history
    );

  const rawState =
    modules[config.id];

  const moduleState = {
    formValues:
      rawState?.formValues || {},

    result:
      rawState?.result || null,

    showAdvanced:
      rawState?.showAdvanced ||
      false,

    sourceInfo:
      rawState?.sourceInfo ||
      null,

    builderStep:
      rawState?.builderStep ||
      'input',

    requirements:
      (
        rawState?.requirements ||
        []
      ) as VariableRequirement[],
  };

  const [
    isCampaignLoading,
    setIsCampaignLoading
  ] = useState(false);

  const [
    isDiscovering,
    setIsDiscovering
  ] = useState(false);

  const [
    isCollapsed,
    setIsCollapsed
  ] = useState(false);

  const [
    zoom,
    setZoom
  ] = useState(1);

  const [
    generationStep,
    setGenerationStep
  ] = useState(
    'Инициализация...'
  );

  const [
    error,
    setError
  ] = useState<
    string | null
  >(null);

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const showAdvanced =
    moduleState.showAdvanced;

  const setShowAdvanced = (
    val: boolean
  ) =>
    setModuleState(
      config.id,
      {
        showAdvanced: val
      }
    );

  const result =
    moduleState.result;

  const setResult = (
    val: any
  ) =>
    setModuleState(
      config.id,
      {
        result: val
      }
    );

  const sourceInfo =
    moduleState.sourceInfo;

  const setSourceInfo = (
    val: any
  ) =>
    setModuleState(
      config.id,
      {
        sourceInfo: val
      }
    );

  const formValues =
    React.useMemo(() => {

      const initial:
        Record<
          string,
          any
        > = {};

      config.fields.forEach(
        f => {
          initial[f.id] =
            f.defaultValue ||
            '';
        }
      );

      initial[
        'adv_preset'
      ] = 'business';

      initial[
        'adv_goal'
      ] = 'sell';

      initial[
        'adv_audience'
      ] = 'newbie';

      initial[
        'adv_tone'
      ] = 'friendly';

      initial[
        'adv_formality'
      ] = 24;

      initial[
        'adv_emotion'
      ] = 38;

      initial[
        'adv_length'
      ] = 'balanced';

      initial[
        'adv_complexity'
      ] = 'standard';

      return {
        ...initial,
        ...moduleState.formValues
      };

    }, [
      config.id,
      moduleState.formValues
    ]);

  const setFormValues = (
    updater: (
      prev: Record<
        string,
        any
      >
    ) => Record<
      string,
      any
    >
  ) => {

    const nextValues =
      updater(formValues);

    setModuleState(
      config.id,
      {
        formValues:
          nextValues
      }
    );
  };

  useEffect(() => {

    const state =
      location.state as any;

    if (
      state?.sourceContent
    ) {

      const {
        sourceContent,
        sourceTitle,
        sourceModule,
        sourceId
      } = state;

      setSourceInfo({
        id: sourceId,
        module:
          sourceModule,
        title:
          sourceTitle
      });

      setFormValues(
        prev => {

          const next = {
            ...prev
          };

          if (
            typeof sourceContent ===
            'string'
          ) {

            if (
              next.topic !==
              undefined
            ) {
              next.topic =
                sourceTitle ||
                sourceContent.slice(
                  0,
                  50
                );
            }

            if (
              next.context !==
              undefined
            ) {
              next.context =
                sourceContent;
            }

          } else {

            const topic =
              sourceContent.topic ||
              sourceContent.title ||
              sourceTitle;

            const context =
              sourceContent.description ||
              sourceContent.summary ||
              sourceContent.content;

            if (
              next.topic !==
              undefined
            ) {
              next.topic =
                topic;
            }

            if (
              next.context !==
              undefined
            ) {
              next.context =
                context;
            }

            if (
              sourceContent.channel &&
              next.channels !==
                undefined
            ) {

              next.channels =
                Array.isArray(
                  next.channels
                )
                  ? [
                      sourceContent.channel
                    ]
                  : sourceContent.channel;
            }
          }

          return next;
        }
      );

      toast.info(
        `Использован контент из: ${sourceTitle || sourceModule}`
      );

      navigate(
        location.pathname,
        {
          replace: true,
          state: {}
        }
      );
    }

  }, [
    location,
    navigate
  ]);

  const addGeneration =
    useMemoryStore(
      state =>
        state.addGeneration
    );

  const sharedMemory =
    useMemoryStore(
      state =>
        state.sharedMemory
    );

  const addFavorite =
    useFavoritesStore(
      state =>
        state.addFavorite
    );

  const handleInputChange = (
    id: string,
    value: any
  ) => {

    setFormValues(
      prev => ({
        ...prev,
        [id]: value
      })
    );
  };

  const handleAdvancedChange =
    (
      key:
        keyof AdvancedSettingsState,
      value: any
    ) => {

      setFormValues(
        prev => ({
          ...prev,
          [`adv_${key}`]:
            value
        })
      );
    };

  const steps = [
    'Анализирую структуру...',
    'Проектирую кампанию...',
    'Создаю контент...',
    'Подготавливаю результат...',
    'Финализирую...'
  ];

  const handleCampaignDiscovery =
    async () => {

      setIsDiscovering(
        true
      );

      setError(null);

      try {

        const {
          requirements,
          suggestedChannels
        } =
          await detectCampaignVariables(
            {
              topic:
                formValues.topic,

              context:
                formValues.context
            }
          );

        if (
          suggestedChannels?.length >
          0
        ) {

          handleInputChange(
            'channels',
            suggestedChannels
          );
        }

        setModuleState(
          config.id,
          {
            requirements,
            builderStep:
              'variables'
          }
        );

      } catch (
        err: any
      ) {

        setError(
          err.message
        );

      } finally {

        setIsDiscovering(
          false
        );
      }
    };

  const handleGenerate =
    async () => {

      setIsCampaignLoading(
        true
      );

      setResult(null);

      setError(null);

      setIsCollapsed(
        true
      );

      let stepIndex = 0;

      setGenerationStep(
        steps[0]
      );

      const stepInterval =
        setInterval(() => {

          if (
            stepIndex <
            steps.length - 1
          ) {

            stepIndex++;

            setGenerationStep(
              steps[
                stepIndex
              ]
            );
          }

        }, 2500);

      try {

        if (
          config.id ===
          'newsletters'
        ) {

          let normalizedChannels:
            string[] = [];

          if (
            Array.isArray(
              formValues.channels
            )
          ) {

            normalizedChannels =
              formValues.channels;

          } else if (
            typeof formValues.channels ===
            'string'
          ) {

            normalizedChannels =
              [
                formValues.channels
              ];
          }

          normalizedChannels =
            normalizedChannels

              .map(
                (
                  c: string
                ) =>
                  String(c)
                    .toLowerCase()
                    .trim()
              )

              .filter(
                Boolean
              );

          if (
            normalizedChannels.length ===
            0
          ) {

            normalizedChannels =
              ['telegram'];
          }

          console.log(
            '[Newsletter UI] Selected channels:',
            normalizedChannels
          );

          const request = {
            topic:
              formValues.topic,

            context:
              formValues.context,

            variables: {
              ...brandVariables,
              ...formValues.variables
            },

            channels:
              normalizedChannels,

            advanced:
              showAdvanced
                ? {
                    tone:
                      formValues.adv_tone,

                    emotion:
                      formValues.adv_emotion,
                  }
                : undefined
          };

          console.log(
            '[Newsletter UI] REQUEST:',
            request
          );

          const data =
            await generateCampaign(
              request as any
            );

          setResult(
            data
          );

          setModuleState(
            config.id,
            {
              builderStep:
                'result'
            }
          );

          addGeneration({
            type:
              'newsletter',

            data,

            metadata: {
              topic:
                request.topic,

              channels:
                normalizedChannels
            }
          });

        } else {

          await new Promise(
            resolve =>
              setTimeout(
                resolve,
                3000
              )
          );

          setResult({
            mock: true
          });
        }

      } catch (
        err: any
      ) {

        console.error(
          '[ModulePage] Generation failed:',
          err
        );

        setError(
          err.message ||
          'Ошибка генерации'
        );

      } finally {

        clearInterval(
          stepInterval
        );

        setIsCampaignLoading(
          false
        );
      }
    };

  return (
    <div className="p-10">
      <Button
        onClick={
          config.id ===
            'newsletters' &&
          moduleState.builderStep ===
            'input'
            ? handleCampaignDiscovery
            : handleGenerate
        }
        isLoading={
          isCampaignLoading ||
          isDiscovering
        }
      >
        <Wand2
          size={18}
        />

        <span>
          Генерировать
        </span>
      </Button>
    </div>
  );
}